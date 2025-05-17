import { Expose } from 'class-transformer';

export default class RefreshAccessResponse {
  constructor(partial?: Partial<RefreshAccessResponse>) {
    Object.assign(this, partial);
  }

  @Expose()
  access_token: string;
}
