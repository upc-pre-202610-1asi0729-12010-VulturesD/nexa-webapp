import { User } from '@/iam/domain/model/entities/user.entity';
import { UserResource } from './user.resource';

export const UserAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new User(resource);
  },

  toResource(entity, source = {}) {
    if (!entity) return null;
    return new UserResource({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: source.password,
      role: source.role,
      scope: entity.scope,
      roleKey: entity.roleKey.value,
      roleName: entity.roleName,
      department: entity.department,
      initials: entity.initials,
      clientId: entity.clientId,
      accessToken: source.accessToken || null,
    });
  },
};
