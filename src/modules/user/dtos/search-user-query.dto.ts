import { IsOptional, IsString, MinLength } from 'class-validator';
import { CursorPaginationQueryParamsDto } from 'src/dto/pagination.dto';

export default class SearchUserQueryParams extends CursorPaginationQueryParamsDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
