export interface UserIdentityVerificationFailedEvent {
  readonly kind: 'UserIdentityVerificationFailed';
  readonly email: string;
  readonly reason: string;
  readonly at: string;
}
