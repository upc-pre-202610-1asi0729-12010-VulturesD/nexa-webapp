export interface ChangePasswordCommand {
  readonly kind: 'ChangePassword';
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
}
