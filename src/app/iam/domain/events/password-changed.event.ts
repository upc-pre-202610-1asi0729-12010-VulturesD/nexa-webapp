export interface PasswordChangedEvent {
  readonly kind: 'PasswordChanged';
  readonly userId: string;
  readonly at: string;
}
