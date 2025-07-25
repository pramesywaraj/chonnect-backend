import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CursorPaginationDto<T> {
  @Expose()
  has_more: boolean;

  @Expose()
  @IsOptional()
  next_cursor?: string | null;

  @Expose()
  data: T[];

  constructor(data: T[], has_more: boolean, next_cursor?: string | null) {
    this.data = data;
    this.has_more = has_more;
    this.next_cursor = next_cursor === undefined ? undefined : next_cursor;
  }
}

export class CursorPaginationQueryParamsDto {
  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
