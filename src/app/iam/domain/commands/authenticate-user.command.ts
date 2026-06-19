export interface AuthenticateUserCommand {
  readonly kind: 'AuthenticateUser';
  readonly email: string;
  readonly password: string;
}
