import { IsOptional, IsString, MinLength } from 'class-validator';

export default class SearchUserQueryParams {
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
