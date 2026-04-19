export interface RegistrationRequest {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly requestedRole?: string;
}
