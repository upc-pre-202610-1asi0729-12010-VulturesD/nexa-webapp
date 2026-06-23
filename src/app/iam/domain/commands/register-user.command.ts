export interface RegisterUserCommand {
  readonly kind: 'RegisterUser';
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly requestedRole?: string;
}
