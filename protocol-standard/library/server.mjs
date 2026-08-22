/**
 * Section 4 -- Entry point.
 *
 * Starts the protocol library HTTP server on port 4174.
 * Seeds the store with example protocols from examples/ for demonstration.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProtocolStore } from './store.mjs';
import { createApi } from './api.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, '..');
const PORT      = 4174;

/* ================================================================
 *  Create store and seed data
 * ================================================================ */

const store = new ProtocolStore();

// --- Users ---
const admin = store.createUser('LabRecord Admin', { isAdmin: true });
const alice = store.createUser('Alice Chen', {
  orcid: 'https://orcid.org/0000-0001-2345-6789',
});
const bob = store.createUser('Bob Smith');

// --- Lab ---
const lab = store.createLab('Molecular Biology Lab', alice.id);
store.setMembership(lab.id, bob.id, 'editor');

// --- Load and publish example protocols ---
function loadExample(filename) {
  return JSON.parse(
    readFileSync(join(root, 'examples', filename), 'utf8')
  );
}

// qPCR protocol (public, published)
const qpcrBody = loadExample('qpcr.json');
const { protocol: qpcrProto, version: qpcrDraft } =
  store.createProtocol(qpcrBody, 'public', admin.id, admin.id);
store.freezeVersion(qpcrDraft.id);

// Cell culture protocol (public, published)
const ccBody = loadExample('cell-culture.json');
const { protocol: ccProto, version: ccDraft } =
  store.createProtocol(ccBody, 'public', admin.id, admin.id);
store.freezeVersion(ccDraft.id);

/* ================================================================
 *  Start server
 * ================================================================ */

const server = createApi(store);

server.listen(PORT, () => {
  console.log('');
  console.log('Protocol Library Server (Section 4 reference implementation)');
  console.log('='.repeat(58));
  console.log(`Listening on http://localhost:${PORT}`);
  console.log('');
  console.log('Seeded data:');
  console.log(`  Admin:       ${admin.id}  (${admin.name})`);
  console.log(`  User alice:  ${alice.id}  (${alice.name})`);
  console.log(`  User bob:    ${bob.id}  (${bob.name})`);
  console.log(`  Lab:         ${lab.id}  (${lab.name})`);
  console.log(`    Members:   ${alice.name} (owner), ${bob.name} (editor)`);
  console.log('');
  console.log('Public protocols:');
  console.log(`  ${qpcrProto.id}  ${qpcrProto.title}`);
  console.log(`    version ${qpcrDraft.id}  (published, hash ${qpcrDraft.contentHash?.slice(0, 12)}...)`);
  console.log(`  ${ccProto.id}  ${ccProto.title}`);
  console.log(`    version ${ccDraft.id}  (published, hash ${ccDraft.contentHash?.slice(0, 12)}...)`);
  console.log('');
  console.log('Endpoints:');
  console.log('  POST   /api/protocols                   Create draft protocol');
  console.log('  GET    /api/protocols/:id               Get protocol + current version');
  console.log('  POST   /api/protocols/:id/versions      Freeze draft -> immutable version');
  console.log('  GET    /api/protocols/:id/history       Version chain + lineage');
  console.log('  POST   /api/public/:versionId/save-ref  Save reference to public version');
  console.log('  POST   /api/public/:versionId/fork      Fork public version to private');
  console.log('  POST   /api/labs/:labId/submissions     Submit to lab for review');
  console.log('  POST   /api/submissions/:id/review      Approve / request changes');
  console.log('  POST   /api/versions/:versionId/runs    Create run from version');
  console.log('  GET    /api/views/public                Public library');
  console.log('  GET    /api/views/my                    Your private protocols');
  console.log('  GET    /api/views/lab/:labId            Lab protocols');
  console.log('');
  console.log('Auth: set X-User-Id header to one of the user IDs above.');
  console.log('');
});
