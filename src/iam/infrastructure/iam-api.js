import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { baseApi } from '@/shared/infrastructure/base-api';

/**
 * IAM API service.
 *
 * @summary Provides HTTP operations for user authentication.
 * @class IamApiService
 */
class IamApiService {
  constructor() {
    this.users = new BaseEndpoint('/api/v1/users');
  }

  /**
   * @summary Gets all user resources.
   * @returns {Promise<Array>} User collection.
   */
  getUsers() {
    if (baseApi.coreBackendEnabled) {
      return Promise.resolve([
        {
          id: "USR-LOGISTICS",
          name: "Roberto Garcia",
          email: "logistics@nexa.com",
          password: "Nexa2026!",
          role: "ops",
          scope: "ops",
          roleKey: "logistics",
          roleName: "Logistics",
          department: "Logistics",
          initials: "RG"
        },
        {
          id: "USR-SALES",
          name: "Valeria Sanchez",
          email: "sales@nexa.com",
          password: "Nexa2026!",
          role: "ops",
          scope: "ops",
          roleKey: "commercial",
          roleName: "Sales",
          department: "Sales",
          initials: "VS"
        },
        {
          id: "USR-BUYER",
          name: "Elena Litano",
          email: "buyer@nexa.com",
          password: "Nexa2026!",
          role: "portal",
          scope: "portal",
          roleKey: "buyer",
          roleName: "B2B Buyer",
          department: "Purchasing",
          initials: "EL",
          clientId: "CLI-001"
        }
      ]);
    }
    return this.users.getAll();
  }

  /**
   * @summary Finds a user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>} User record or null if not found.
   */
  findUserByEmail(email) {
    return this.getUsers().then(users =>
      users.find(user => user.email === email || (user.aliases || []).includes(email)) || null
    );
  }
}

export const iamApiService = new IamApiService();
