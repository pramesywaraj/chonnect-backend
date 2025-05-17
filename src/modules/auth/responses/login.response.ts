import { Expose } from 'class-transformer';

export default class LoginResponse {
  constructor(partial?: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }

  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
