export class UserResource {
  constructor({
    id,
    name,
    email,
    password,
    role,
    scope,
    roleKey,
    roleName,
    department,
    initials,
    clientId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.scope = scope;
    this.roleKey = roleKey;
    this.roleName = roleName;
    this.department = department;
    this.initials = initials;
    this.clientId = clientId;
  }
}
