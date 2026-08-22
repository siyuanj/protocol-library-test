/**
 * Section 4 -- Permission checker.
 *
 * Implements the Section 3 Section 2 permission matrix:
 *
 *   | Action             | Public visitor | Private owner | Lab viewer | Lab editor | Lab reviewer/owner | Admin |
 *   |--------------------|---------------|---------------|------------|------------|-------------------|-------|
 *   | view               | public only   | own           | member     | yes        | yes               | yes   |
 *   | edit               | --            | own           | --         | yes        | yes               | pub   |
 *   | fork               | public        | own           | member     | yes        | yes               | yes   |
 *   | save_reference     | public        | public        | public     | public     | public            | pub   |
 *   | submit_to_lab      | --            | own           | --         | --         | --                | --    |
 *   | approve            | --            | --            | --         | --         | yes               | --    |
 *   | create_run         | --            | own           | member     | yes        | yes               | yes   |
 *   | publish            | --            | --            | --         | --         | --                | yes   |
 *
 * @module permissions
 */

/**
 * Check whether a user can perform an action on a protocol.
 *
 * @param {Object}  user           - { id, name, isAdmin }
 * @param {string}  action         - view | edit | fork | save_reference | submit_to_lab | approve | create_run | publish
 * @param {Object}  protocol       - { id, library, ownerRef }
 * @param {Object} [labMembership] - { labId, userId, role } where role in {viewer, editor, reviewer, owner}
 * @returns {boolean}
 */
export function canPerform(user, action, protocol, labMembership) {
  if (!user || !action || !protocol) return false;

  const isAdmin   = user.isAdmin === true;
  const library   = protocol.library;
  const isOwner   = protocol.ownerRef === user.id;
  const labRole   = labMembership ? labMembership.role : null;
  const isMember  = !!labRole;

  switch (action) {

    /* ---- view ---- */
    case 'view':
      if (library === 'public')  return true;                     // anyone
      if (library === 'private') return isOwner || isAdmin;
      if (library === 'lab')     return isMember || isAdmin;
      return false;

    /* ---- edit ---- */
    case 'edit':
      if (library === 'public')  return isAdmin;
      if (library === 'private') return isOwner;
      if (library === 'lab')     return ['editor', 'reviewer', 'owner'].includes(labRole);
      return false;

    /* ---- fork ---- */
    case 'fork':
      if (library === 'public')  return true;                     // anyone can fork public
      if (library === 'private') return isOwner;                  // fork own private
      if (library === 'lab')     return isMember || isAdmin;
      return false;

    /* ---- save_reference (public versions only) ---- */
    case 'save_reference':
      return library === 'public';                                // anyone, but only public

    /* ---- submit_to_lab ---- */
    case 'submit_to_lab':
      // The caller owns the source version; lab membership is checked separately
      // at the API layer (must be a member of the target lab).
      if (library === 'public')  return true;
      if (library === 'private') return isOwner;
      if (library === 'lab')     return isMember;
      return false;

    /* ---- approve (lab reviewer/owner only) ---- */
    case 'approve':
      if (library === 'lab') return ['reviewer', 'owner'].includes(labRole);
      return false;

    /* ---- create_run ---- */
    case 'create_run':
      if (library === 'private') return isOwner;
      if (library === 'lab')     return isMember || isAdmin;
      if (library === 'public')  return isAdmin;                  // admin only for public
      return false;

    /* ---- publish (admin only) ---- */
    case 'publish':
      return isAdmin;

    default:
      return false;
  }
}
