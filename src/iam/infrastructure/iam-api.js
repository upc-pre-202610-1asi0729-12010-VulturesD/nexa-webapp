import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

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
   * @summary Gets all demo user resources.
   * @returns {Promise<Array>} User collection.
   */
  getUsers() {
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
