export interface UserIdentityVerifiedEvent {
  readonly kind: 'UserIdentityVerified';
  readonly userId: string;
  readonly email: string;
  readonly at: string;
}
