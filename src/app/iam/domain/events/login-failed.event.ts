export interface LoginFailedEvent {
  readonly kind: 'LoginFailed';
  readonly email: string;
  readonly reason: string;
  readonly at: string;
}
