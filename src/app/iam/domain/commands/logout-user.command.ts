export interface LogoutUserCommand {
  readonly kind: 'LogoutUser';
  readonly userId: string;
}
