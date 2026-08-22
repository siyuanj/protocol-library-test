/**
 * Section 4 -- HTTP API layer.
 *
 * Minimal Node.js http server with pattern-matching router.
 * No external dependencies (uses only node:http).
 *
 * Endpoints (from Section 3 Section 9):
 *   POST   /api/protocols                   -- create draft
 *   GET    /api/protocols/:id               -- get protocol + current version
 *   POST   /api/protocols/:id/versions      -- freeze draft -> immutable version
 *   GET    /api/protocols/:id/history       -- version chain + lineage
 *   POST   /api/public/:versionId/save-ref  -- create SavedReference
 *   POST   /api/public/:versionId/fork      -- fork to private
 *   POST   /api/labs/:labId/submissions     -- submit to lab
 *   POST   /api/submissions/:id/review      -- approve / request_changes
 *   POST   /api/versions/:versionId/runs    -- create Run
 *   GET    /api/views/public                -- public library view
 *   GET    /api/views/my                    -- user's private protocols
 *   GET    /api/views/lab/:labId            -- lab protocols
 *
 * Auth: user identified by X-User-Id request header.
 */
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { validateProtocol } from './validator.mjs';
import { canPerform } from './permissions.mjs';

/* ================================================================
 *  Minimal pattern-matching router
 * ================================================================ */

class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Register a route.
   * @param {string} method  - HTTP method
   * @param {string} pattern - URL pattern with :param placeholders
   * @param {Function} handler
   */
  add(method, pattern, handler) {
    const paramNames = [];
    const reStr = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const re = new RegExp('^' + reStr + '$');
    this.routes.push({ method, re, paramNames, handler });
  }

  /**
   * Find a matching route.
   * @returns {{ handler, params }|null}
   */
  match(method, pathname) {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = pathname.match(r.re);
      if (m) {
        const params = {};
        r.paramNames.forEach((n, i) => {
          params[n] = decodeURIComponent(m[i + 1]);
        });
        return { handler: r.handler, params };
      }
    }
    return null;
  }
}

/* ================================================================
 *  Helpers
 * ================================================================ */

/** Read and parse a JSON request body. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/** Send a JSON response. */
function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/** Summarise a version (without the full body) for list views. */
function versionSummary(v) {
  if (!v) return null;
  return {
    id:                   v.id,
    protocolId:           v.protocolId,
    versionNo:            v.versionNo,
    status:               v.status,
    contentHash:          v.contentHash,
    parentVersionId:      v.parentVersionId,
    derivedFromVersionId: v.derivedFromVersionId,
    createdBy:            v.createdBy,
    createdAt:            v.createdAt,
    bodyTitle:            v.body?.metadata?.title || null,
  };
}

/* ================================================================
 *  API factory
 * ================================================================ */

/**
 * Create the HTTP server wired to a ProtocolStore.
 *
 * @param {import('./store.mjs').ProtocolStore} store
 * @returns {import('node:http').Server}
 */
export function createApi(store) {
  const router = new Router();

  /* -------------------------------------------------------------- */
  /*  POST /api/protocols -- create draft                            */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/protocols', async (_req, res, ctx) => {
    const { body, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });
    if (!body.body) {
      return send(res, 400, { error: 'body.body (protocol JSON) is required' });
    }

    const library = body.library || 'private';
    if (!['public', 'private', 'lab'].includes(library)) {
      return send(res, 400, { error: 'library must be public, private, or lab' });
    }

    // Permission: only admins can create public protocols
    if (library === 'public' && !user.isAdmin) {
      return send(res, 403, { error: 'Only admins can create public protocols' });
    }

    // For lab protocols, check membership
    if (library === 'lab') {
      if (!body.labId) {
        return send(res, 400, { error: 'labId required for lab protocols' });
      }
      const lab = store.getLab(body.labId);
      if (!lab) return send(res, 404, { error: 'Lab not found' });
      const membership = store.getMembership(body.labId, user.id);
      if (!membership || !['editor', 'reviewer', 'owner'].includes(membership.role)) {
        return send(res, 403, { error: 'Must be at least an editor in the lab' });
      }
    }

    // Validate the protocol body
    const validation = validateProtocol(body.body);
    if (!validation.valid) {
      return send(res, 400, { error: 'Validation failed', errors: validation.errors });
    }

    const ownerRef = library === 'lab' ? body.labId : user.id;
    const result = store.createProtocol(body.body, library, ownerRef, user.id);
    send(res, 201, result);
  });

  /* -------------------------------------------------------------- */
  /*  GET /api/protocols/:id -- get protocol + current version       */
  /* -------------------------------------------------------------- */

  router.add('GET', '/api/protocols/:id', async (_req, res, ctx) => {
    const { params, user } = ctx;
    const protocol = store.getProtocol(params.id);
    if (!protocol) return send(res, 404, { error: 'Protocol not found' });

    // Permission check
    const membership = (protocol.library === 'lab' && user)
      ? store.getMembership(protocol.ownerRef, user.id)
      : null;
    if (!canPerform(user || { id: null }, 'view', protocol, membership)) {
      return send(res, 403, { error: 'Access denied' });
    }

    const version = store.getVersion(protocol.currentVersionId);
    send(res, 200, { protocol, currentVersion: version });
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/protocols/:id/versions -- freeze draft               */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/protocols/:id/versions', async (_req, res, ctx) => {
    const { params, body, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const protocol = store.getProtocol(params.id);
    if (!protocol) return send(res, 404, { error: 'Protocol not found' });

    // Permission check
    const membership = (protocol.library === 'lab' && user)
      ? store.getMembership(protocol.ownerRef, user.id)
      : null;
    if (!canPerform(user, 'edit', protocol, membership)) {
      return send(res, 403, { error: 'Access denied' });
    }

    try {
      const currentVersion = store.getVersion(protocol.currentVersionId);

      if (body.body) {
        // Validate the new body
        const validation = validateProtocol(body.body);
        if (!validation.valid) {
          return send(res, 400, {
            error: 'Validation failed',
            errors: validation.errors,
          });
        }

        if (currentVersion.status === 'draft') {
          // Update draft body, then freeze
          store.updateDraftBody(currentVersion.id, body.body);
          const frozen = store.freezeVersion(currentVersion.id);
          return send(res, 200, { version: frozen });
        } else {
          // Current is frozen: create new version, then freeze
          const newVer = store.createNewVersion(
            params.id, body.body, user.id
          );
          const frozen = store.freezeVersion(newVer.id);
          return send(res, 201, { version: frozen });
        }
      } else {
        // No body: just freeze the current draft
        if (currentVersion.status !== 'draft') {
          return send(res, 400, {
            error: 'Current version is already frozen; provide body to create a new version',
          });
        }
        const frozen = store.freezeVersion(currentVersion.id);
        return send(res, 200, { version: frozen });
      }
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  GET /api/protocols/:id/history -- version chain + lineage      */
  /* -------------------------------------------------------------- */

  router.add('GET', '/api/protocols/:id/history', async (_req, res, ctx) => {
    const { params, user } = ctx;
    const protocol = store.getProtocol(params.id);
    if (!protocol) return send(res, 404, { error: 'Protocol not found' });

    const membership = (protocol.library === 'lab' && user)
      ? store.getMembership(protocol.ownerRef, user.id)
      : null;
    if (!canPerform(user || { id: null }, 'view', protocol, membership)) {
      return send(res, 403, { error: 'Access denied' });
    }

    const versions = store.getVersionHistory(params.id);
    send(res, 200, {
      protocolId: params.id,
      versions:   versions.map(versionSummary),
    });
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/public/:versionId/save-ref -- SavedReference         */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/public/:versionId/save-ref', async (_req, res, ctx) => {
    const { params, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const version = store.getVersion(params.versionId);
    if (!version) return send(res, 404, { error: 'Version not found' });

    const protocol = store.getProtocol(version.protocolId);
    if (!protocol || protocol.library !== 'public') {
      return send(res, 400, { error: 'Can only save references to public versions' });
    }

    try {
      const ref = store.createSavedReference(user.id, params.versionId);
      send(res, 201, ref);
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/public/:versionId/fork -- fork to private            */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/public/:versionId/fork', async (_req, res, ctx) => {
    const { params, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const version = store.getVersion(params.versionId);
    if (!version) return send(res, 404, { error: 'Version not found' });

    const protocol = store.getProtocol(version.protocolId);
    if (!protocol) return send(res, 404, { error: 'Protocol not found' });

    if (!canPerform(user, 'fork', protocol)) {
      return send(res, 403, { error: 'Access denied' });
    }

    try {
      const result = store.forkToPrivate(params.versionId, user.id);
      send(res, 201, result);
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/labs/:labId/submissions -- submit to lab             */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/labs/:labId/submissions', async (_req, res, ctx) => {
    const { params, body, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });
    if (!body.sourceVersionId) {
      return send(res, 400, { error: 'sourceVersionId required' });
    }

    const lab = store.getLab(params.labId);
    if (!lab) return send(res, 404, { error: 'Lab not found' });

    // Must be a lab member to submit
    const membership = store.getMembership(params.labId, user.id);
    if (!membership) {
      return send(res, 403, { error: 'Must be a lab member to submit' });
    }

    try {
      const result = store.createSubmission(
        params.labId, body.sourceVersionId, user.id
      );
      send(res, 201, {
        submission: result.submission,
        protocol:   result.protocol,
        version:    versionSummary(result.version),
      });
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/submissions/:id/review -- approve / request_changes  */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/submissions/:id/review', async (_req, res, ctx) => {
    const { params, body, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });
    if (!body.decision) {
      return send(res, 400, {
        error: 'decision required (approved or changes_requested)',
      });
    }

    const submission = store.getSubmission(params.id);
    if (!submission) return send(res, 404, { error: 'Submission not found' });

    // Permission: reviewer/owner in the lab
    const membership = store.getMembership(submission.labId, user.id);
    const labProtocol = { library: 'lab', ownerRef: submission.labId };
    if (!canPerform(user, 'approve', labProtocol, membership)) {
      return send(res, 403, {
        error: 'Only reviewers/owners can review submissions',
      });
    }

    try {
      const review = store.reviewSubmission(
        params.id, user.id, body.decision, body.comment
      );
      send(res, 200, {
        review,
        submissionState: submission.state,
      });
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  POST /api/versions/:versionId/runs -- create Run               */
  /* -------------------------------------------------------------- */

  router.add('POST', '/api/versions/:versionId/runs', async (_req, res, ctx) => {
    const { params, body, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const version = store.getVersion(params.versionId);
    if (!version) return send(res, 404, { error: 'Version not found' });

    const protocol = store.getProtocol(version.protocolId);
    if (!protocol) return send(res, 404, { error: 'Protocol not found' });

    const membership = (protocol.library === 'lab')
      ? store.getMembership(protocol.ownerRef, user.id)
      : null;
    if (!canPerform(user, 'create_run', protocol, membership)) {
      return send(res, 403, { error: 'Access denied' });
    }

    try {
      const run = store.createRun(
        params.versionId,
        body.operator || user.name
      );
      // Return run without the full snapshot for brevity
      send(res, 201, {
        id:                run.id,
        protocolVersionId: run.protocolVersionId,
        operator:          run.operator,
        startedAt:         run.startedAt,
        snapshotHash:      run.snapshot
          ? createHash('sha256')
              .update(JSON.stringify(run.snapshot))
              .digest('hex')
          : null,
      });
    } catch (err) {
      send(res, 400, { error: err.message });
    }
  });

  /* -------------------------------------------------------------- */
  /*  GET /api/views/public -- public library view                   */
  /* -------------------------------------------------------------- */

  router.add('GET', '/api/views/public', async (_req, res, _ctx) => {
    const protocols = store.getPublicProtocols();
    const result = protocols.map((p) => ({
      ...p,
      currentVersion: versionSummary(store.getVersion(p.currentVersionId)),
    }));
    send(res, 200, { protocols: result });
  });

  /* -------------------------------------------------------------- */
  /*  GET /api/views/my -- user's private protocols                  */
  /* -------------------------------------------------------------- */

  router.add('GET', '/api/views/my', async (_req, res, ctx) => {
    const { user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const protocols = store.getUserProtocols(user.id);
    const result = protocols.map((p) => ({
      ...p,
      currentVersion: versionSummary(store.getVersion(p.currentVersionId)),
    }));
    send(res, 200, { protocols: result });
  });

  /* -------------------------------------------------------------- */
  /*  GET /api/views/lab/:labId -- lab protocols                     */
  /* -------------------------------------------------------------- */

  router.add('GET', '/api/views/lab/:labId', async (_req, res, ctx) => {
    const { params, user } = ctx;
    if (!user) return send(res, 401, { error: 'X-User-Id header required' });

    const lab = store.getLab(params.labId);
    if (!lab) return send(res, 404, { error: 'Lab not found' });

    const membership = store.getMembership(params.labId, user.id);
    if (!membership && !user.isAdmin) {
      return send(res, 403, { error: 'Must be a lab member to view lab protocols' });
    }

    const protocols = store.getLabProtocols(params.labId);
    const result = protocols.map((p) => ({
      ...p,
      currentVersion: versionSummary(store.getVersion(p.currentVersionId)),
    }));
    send(res, 200, { protocols: result });
  });

  /* ================================================================
   *  HTTP server
   * ================================================================ */

  const server = createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsed   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsed.pathname;
    const userId   = req.headers['x-user-id'];
    const user     = userId ? store.getUser(userId) : null;

    const match = router.match(req.method, pathname);
    if (!match) {
      return send(res, 404, { error: `No route: ${req.method} ${pathname}` });
    }

    try {
      const reqBody = (req.method === 'POST' || req.method === 'PUT')
        ? await readBody(req)
        : {};

      await match.handler(req, res, {
        params: match.params,
        body:   reqBody,
        user,
        url:    parsed,
      });
    } catch (err) {
      const status = err.message.includes('Invalid JSON') ? 400 : 500;
      send(res, status, { error: err.message });
    }
  });

  return server;
}
