/**
 * Section 4 -- In-memory protocol store.
 *
 * Implements the Section 3 data model:
 *   User, Lab, LabMembership, Protocol, ProtocolVersion,
 *   SavedReference, LabSubmission, Review, Run.
 *
 * - Uses simple in-memory Maps (no database -- reference implementation).
 * - Content hash: SHA-256 of JSON.stringify(body).
 * - Immutability: published/approved versions cannot be mutated.
 * - Provenance: parentVersionId (lineage), derivedFromVersionId (fork/submission source).
 */
import { createHash, randomUUID } from 'node:crypto';

// structuredClone fallback for Node < 17
const clone = typeof structuredClone === 'function'
  ? structuredClone
  : (obj) => JSON.parse(JSON.stringify(obj));

export class ProtocolStore {
  constructor() {
    this.users       = new Map();
    this.labs         = new Map();
    this.memberships  = new Map();   // key: `${labId}:${userId}`
    this.protocols    = new Map();
    this.versions     = new Map();
    this.savedRefs    = new Map();
    this.submissions  = new Map();
    this.reviews      = new Map();
    this.runs         = new Map();
  }

  /** Generate a new unique ID. */
  _id() { return randomUUID(); }

  /** SHA-256 content hash of a protocol body. */
  static contentHash(body) {
    return createHash('sha256')
      .update(JSON.stringify(body))
      .digest('hex');
  }

  /* ================================================================
   *  User
   * ================================================================ */

  createUser(name, opts = {}) {
    const user = {
      id:      this._id(),
      name,
      orcid:   opts.orcid   || null,
      isAdmin: !!opts.isAdmin,
    };
    this.users.set(user.id, user);
    return user;
  }

  getUser(id) {
    return this.users.get(id) || null;
  }

  /* ================================================================
   *  Lab
   * ================================================================ */

  createLab(name, ownerUserId) {
    const lab = { id: this._id(), name, ownerUserId };
    this.labs.set(lab.id, lab);
    // Lab creator automatically becomes owner
    this.setMembership(lab.id, ownerUserId, 'owner');
    return lab;
  }

  getLab(id) {
    return this.labs.get(id) || null;
  }

  /* ================================================================
   *  LabMembership
   * ================================================================ */

  /**
   * Set (or update) a user's role in a lab.
   * @param {string} labId
   * @param {string} userId
   * @param {'viewer'|'editor'|'reviewer'|'owner'} role
   */
  setMembership(labId, userId, role) {
    const key = `${labId}:${userId}`;
    const m = { labId, userId, role };
    this.memberships.set(key, m);
    return m;
  }

  getMembership(labId, userId) {
    return this.memberships.get(`${labId}:${userId}`) || null;
  }

  getLabMembers(labId) {
    return [...this.memberships.values()].filter((m) => m.labId === labId);
  }

  /* ================================================================
   *  Protocol + initial ProtocolVersion
   * ================================================================ */

  /**
   * Create a new protocol with an initial draft version.
   *
   * @param {Object} body      - The canonical protocol JSON
   * @param {'public'|'private'|'lab'} library
   * @param {string} ownerRef  - userId (private) or labId (lab) or adminId (public)
   * @param {string} createdBy - userId of the creator
   * @returns {{ protocol: Object, version: Object }}
   */
  createProtocol(body, library, ownerRef, createdBy) {
    const protocolId = this._id();
    const versionId  = this._id();

    const version = {
      id:                 versionId,
      protocolId,
      versionNo:          1,
      contentHash:        null,          // set on freeze
      body:               clone(body),
      status:             'draft',
      parentVersionId:    null,
      derivedFromVersionId: null,
      createdBy,
      createdAt:          new Date().toISOString(),
      license:            body.metadata?.license || null,
    };

    const protocol = {
      id:               protocolId,
      library,
      ownerRef,
      currentVersionId: versionId,
      family:           body.metadata?.family   || null,
      category:         body.metadata?.category || null,
      title:            body.metadata?.title    || 'Untitled',
    };

    this.versions.set(versionId, version);
    this.protocols.set(protocolId, protocol);
    return { protocol, version };
  }

  getProtocol(id) {
    return this.protocols.get(id) || null;
  }

  /* ================================================================
   *  ProtocolVersion
   * ================================================================ */

  getVersion(id) {
    return this.versions.get(id) || null;
  }

  /**
   * Update the body of a mutable (draft / changes_requested) version.
   * Throws if the version is immutable.
   */
  updateDraftBody(versionId, newBody) {
    const v = this.versions.get(versionId);
    if (!v) throw new Error('Version not found');
    if (v.status !== 'draft' && v.status !== 'changes_requested') {
      throw new Error(
        `Cannot update: version is immutable (status: ${v.status})`
      );
    }
    v.body = clone(newBody);
    return v;
  }

  /**
   * Freeze a draft version: compute contentHash, set status to 'published'.
   * Only draft versions can be frozen this way.
   */
  freezeVersion(versionId) {
    const v = this.versions.get(versionId);
    if (!v) throw new Error('Version not found');
    if (v.status !== 'draft') {
      throw new Error(
        `Can only freeze draft versions (current: ${v.status})`
      );
    }
    v.contentHash = ProtocolStore.contentHash(v.body);
    v.status = 'published';
    return v;
  }

  /**
   * Create a new version of an existing protocol (e.g. after freezing the previous one).
   *
   * @param {string} protocolId
   * @param {Object} body
   * @param {string} createdBy
   * @param {Object} [opts]
   * @param {string} [opts.derivedFromVersionId] - cross-lineage source (fork/submission)
   * @returns {Object} the new ProtocolVersion
   */
  createNewVersion(protocolId, body, createdBy, opts = {}) {
    const protocol = this.protocols.get(protocolId);
    if (!protocol) throw new Error('Protocol not found');

    const history = this.getVersionHistory(protocolId);
    const maxVer  = history.reduce((mx, v) => Math.max(mx, v.versionNo), 0);

    const versionId = this._id();
    const version = {
      id:                   versionId,
      protocolId,
      versionNo:            maxVer + 1,
      contentHash:          null,
      body:                 clone(body),
      status:               'draft',
      parentVersionId:      protocol.currentVersionId,
      derivedFromVersionId: opts.derivedFromVersionId || null,
      createdBy,
      createdAt:            new Date().toISOString(),
      license:              body.metadata?.license || null,
    };

    this.versions.set(versionId, version);
    protocol.currentVersionId = versionId;
    return version;
  }

  /**
   * Return all versions for a protocol, sorted by versionNo ascending.
   */
  getVersionHistory(protocolId) {
    return [...this.versions.values()]
      .filter((v) => v.protocolId === protocolId)
      .sort((a, b) => a.versionNo - b.versionNo);
  }

  /* ================================================================
   *  SavedReference
   * ================================================================ */

  /**
   * Create a saved reference (pointer) to a public version.
   * No copy is made -- the reference resolves to the same content.
   */
  createSavedReference(userOrLabRef, targetVersionId) {
    const v = this.versions.get(targetVersionId);
    if (!v) throw new Error('Target version not found');

    const ref = {
      id:              this._id(),
      userOrLabRef,
      targetVersionId,
      savedAt:         new Date().toISOString(),
    };
    this.savedRefs.set(ref.id, ref);
    return ref;
  }

  getUserSavedRefs(userId) {
    return [...this.savedRefs.values()]
      .filter((r) => r.userOrLabRef === userId);
  }

  /* ================================================================
   *  Fork
   * ================================================================ */

  /**
   * Fork a version into a new private protocol.
   * Sets derivedFromVersionId to the source version for lineage tracking.
   */
  forkToPrivate(sourceVersionId, userId) {
    const src = this.versions.get(sourceVersionId);
    if (!src) throw new Error('Source version not found');

    const body = clone(src.body);
    const { protocol, version } = this.createProtocol(body, 'private', userId, userId);
    version.derivedFromVersionId = sourceVersionId;
    return { protocol, version };
  }

  /* ================================================================
   *  Lab Submission (review workflow)
   * ================================================================ */

  /**
   * Submit a version to a lab.
   * Creates a new lab-owned protocol + version (status: submitted)
   * with derivedFromVersionId linking back to the source.
   */
  createSubmission(labId, sourceVersionId, submittedBy) {
    const lab = this.labs.get(labId);
    if (!lab) throw new Error('Lab not found');
    const src = this.versions.get(sourceVersionId);
    if (!src) throw new Error('Source version not found');

    const body = clone(src.body);
    const { protocol, version } = this.createProtocol(body, 'lab', labId, submittedBy);
    version.derivedFromVersionId = sourceVersionId;
    version.status = 'submitted';

    const submission = {
      id:              this._id(),
      labId,
      sourceVersionId,
      draftVersionId:  version.id,
      submittedBy,
      state:           'submitted',
    };
    this.submissions.set(submission.id, submission);

    return { submission, protocol, version };
  }

  getSubmission(id) {
    return this.submissions.get(id) || null;
  }

  /**
   * Record a review decision on a submission.
   *
   * - 'approved'         -> version.status = 'approved', contentHash stamped
   * - 'changes_requested' -> version.status = 'changes_requested'
   */
  reviewSubmission(submissionId, reviewerId, decision, comment) {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error('Submission not found');
    if (sub.state !== 'submitted') {
      throw new Error(
        `Submission not in submitted state (current: ${sub.state})`
      );
    }
    if (!['approved', 'changes_requested'].includes(decision)) {
      throw new Error('Decision must be approved or changes_requested');
    }

    const review = {
      id:         this._id(),
      submissionId,
      reviewerId,
      decision,
      comment:    comment || '',
      reviewedAt: new Date().toISOString(),
    };
    this.reviews.set(review.id, review);

    // Update submission state
    sub.state = decision;

    // Update version status (+ stamp hash on approval)
    const version = this.versions.get(sub.draftVersionId);
    if (version) {
      if (decision === 'approved') {
        version.status      = 'approved';
        version.contentHash = ProtocolStore.contentHash(version.body);
      } else {
        version.status = 'changes_requested';
      }
    }

    return review;
  }

  getSubmissionReviews(submissionId) {
    return [...this.reviews.values()]
      .filter((r) => r.submissionId === submissionId);
  }

  /* ================================================================
   *  Run
   * ================================================================ */

  /**
   * Create a run from an exact (frozen) version.
   * Stores an immutable snapshot of the body.
   */
  createRun(protocolVersionId, operator) {
    const v = this.versions.get(protocolVersionId);
    if (!v) throw new Error('Version not found');
    if (!v.contentHash) {
      throw new Error(
        'Cannot create run from unfrozen version (must be published or approved)'
      );
    }

    const run = {
      id:                this._id(),
      protocolVersionId,
      snapshot:          clone(v.body),
      operator,
      startedAt:         new Date().toISOString(),
      results:           null,
    };
    this.runs.set(run.id, run);
    return run;
  }

  getVersionRuns(protocolVersionId) {
    return [...this.runs.values()]
      .filter((r) => r.protocolVersionId === protocolVersionId);
  }

  /* ================================================================
   *  View helpers
   * ================================================================ */

  getPublicProtocols() {
    return [...this.protocols.values()].filter((p) => p.library === 'public');
  }

  getUserProtocols(userId) {
    return [...this.protocols.values()]
      .filter((p) => p.library === 'private' && p.ownerRef === userId);
  }

  getLabProtocols(labId) {
    return [...this.protocols.values()]
      .filter((p) => p.library === 'lab' && p.ownerRef === labId);
  }
}
