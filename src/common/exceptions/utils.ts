import { HttpException, HttpStatus } from '@nestjs/common';

interface ThrowHttpErrorParams {
  status?: number;
  title: string;
  detail: string;
  errors?: { message: string }[];
}

export const throwHttpException = ({
  status = HttpStatus.BAD_REQUEST,
  title,
  detail,
  errors = [],
}: ThrowHttpErrorParams): never => {
  throw new HttpException(
    {
      status,
      title,
      detail,
      errors,
    },
    status,
  );
};
