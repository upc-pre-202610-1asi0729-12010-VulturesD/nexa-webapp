export interface UserRegisteredEvent {
  readonly kind: 'UserRegistered';
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly at: string;
}
