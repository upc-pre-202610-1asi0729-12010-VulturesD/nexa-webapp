import { iamApiService } from '../infrastructure/iam-api';
import { UserAssembler } from '../infrastructure/user.assembler';
import { baseApi } from '@/shared/infrastructure/base-api';

/**
 * IAM application use cases.
 *
 * @summary Handles authentication logic against the mock API.
 */
export const iamApplication = {
  /**
   * @summary Returns all users from the API contract.
   * @returns {Promise<Array>}
   */
  getUsers() {
    return iamApiService.getUsers();
  },

  /**
   * @summary Verifies credentials and returns the matching user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object|null>} User record or null on mismatch.
   */
  async verifyCredentials(email, password) {
    if (baseApi.coreBackendEnabled) {
      const response = await baseApi.coreHttp.post('/authentication/sign-in', {
        email: email,
        username: email,
        password: password
      });
      const backendUser = response.data;
      const users = await iamApiService.getUsers();
      const searchEmail = (email || '').toLowerCase().trim();
      let profile = users.find(u => 
        (u.email || '').toLowerCase().trim() === searchEmail || 
        (u.username || '').toLowerCase().trim() === searchEmail
      );
      
      // Safe fallback for buyer.demo@nexa.com
      if (searchEmail === 'buyer.demo@nexa.com') {
        profile = {
          id: "USR-BUYER",
          name: "Elena Litano",
          email: "buyer.demo@nexa.com",
          role: "portal",
          scope: "portal",
          roleKey: "buyer",
          roleName: "B2B Buyer",
          department: "Purchasing",
          initials: "EL",
          clientId: "CLI-001",
          ...(profile || {})
        };
      }

      if (!profile) {
        profile = {};
      }

      return {
        ...profile,
        id: backendUser.id,
        email: backendUser.email,
        role: profile.role || 'ops',
        scope: profile.scope || 'ops',
        roleKey: profile.roleKey || 'commercial',
        roleName: profile.roleName || 'Operator',
        department: profile.department || '',
        initials: profile.initials || 'US',
        clientId: profile.clientId || null,
        accessToken: backendUser.accessToken
      };
    } else {
      const user = await iamApiService.findUserByEmail(email);
      if (!user) return null;
      if (user.password !== password) return null;
      return UserAssembler.toResource(UserAssembler.toEntity(user), user);
    }
  },
};
