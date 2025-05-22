import { IsOptional, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export default class UpdateUserRequestDto {
  @IsOptional()
  @MaxLength(30, { message: 'Name must have max 30 characters!' })
  name?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must have min 6 characters!' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least 1 number',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least 1 special character',
  })
  password?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUrl()
  profile_image?: string;

  @IsOptional()
  refresh_token?: string;
}
