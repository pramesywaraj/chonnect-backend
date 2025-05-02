import { HttpException, HttpStatus } from '@nestjs/common';

export default class NotFounderror extends HttpException {
  constructor(resource: string, identifier: string) {
    super(
      {
        title: 'Not Found',
        status: HttpStatus.NOT_FOUND,
        detail: 'The resource you requested could not be found.',
        errors: [
          {
            message: `${resource} with identifier '${identifier}' was not found`,
          },
        ],
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
