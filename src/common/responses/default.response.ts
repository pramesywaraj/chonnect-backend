export default class DefaultResponse {
  constructor(partial?: Partial<DefaultResponse>) {
    Object.assign(this, partial);
  }

  status_code: number;
  message: string;
}
