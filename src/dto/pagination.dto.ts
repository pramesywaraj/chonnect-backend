import { Expose } from 'class-transformer';

export class CursorPaginationDto<T> {
  @Expose()
  has_more: boolean;

  @Expose()
  data: T[];

  constructor(data: T[], has_more: boolean) {
    this.data = data;
    this.has_more = has_more;
  }
}
