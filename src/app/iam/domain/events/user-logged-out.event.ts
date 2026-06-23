export interface UserLoggedOutEvent {
  readonly kind: 'UserLoggedOut';
  readonly userId: string;
  readonly at: string;
}
