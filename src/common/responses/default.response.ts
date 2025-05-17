export default class DefaultResponse<T = any> {
  status_code: number;
  message: string;
  success: true;
  data: T;

  constructor(partial?: Partial<DefaultResponse<T>>) {
    this.status_code = partial?.status_code ?? 200;
    this.message = partial?.message ?? 'Request success';
    this.success = partial?.success ?? true;
    this.data = partial?.data as T;
  }
}
