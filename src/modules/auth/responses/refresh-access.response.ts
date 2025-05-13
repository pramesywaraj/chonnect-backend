import { Expose } from 'class-transformer';

export class RefreshAccessResponse {
  constructor(partial?: Partial<RefreshAccessResponse>) {
    Object.assign(this, partial);
  }

  @Expose()
  access_token: string;
}
