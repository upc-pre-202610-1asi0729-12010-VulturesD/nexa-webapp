import { iamApiService } from '../infrastructure/iam-api';
import { UserAssembler } from '../infrastructure/user.assembler';

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
    const user = await iamApiService.findUserByEmail(email);
    if (!user) return null;
    if (user.password !== password) return null;
    return UserAssembler.toResource(UserAssembler.toEntity(user), user);
  },
};
