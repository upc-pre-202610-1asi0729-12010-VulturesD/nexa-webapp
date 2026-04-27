import http from '@/shared/infrastructure/http';
import { Profile } from '../domain/model/profile.model';

const BASE = '/api/v1/profile';

export const profileService = {
  async get() {
    try {
      const { data } = await http.get(BASE);
      return new Profile(data);
    } catch {
      return null;
    }
  },

  async update(payload) {
    const { data } = await http.put(BASE, payload);
    return new Profile(data);
  },

  async changePassword(currentPassword, newPassword) {
    return http.post(`${BASE}/password`, { currentPassword, newPassword });
  },
};
