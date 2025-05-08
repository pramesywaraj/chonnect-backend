import { Expose } from 'class-transformer';

export class LoginResponse {
  constructor(partial?: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }

  @Expose()
  access_token: string;
}
