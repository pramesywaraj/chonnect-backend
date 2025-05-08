import { HttpException, HttpStatus } from '@nestjs/common';

export default class NotFoundException extends HttpException {
  constructor(resource: string, identifier: string) {
    super(
      {
        title: 'Not Found',
        status_code: HttpStatus.NOT_FOUND,
        message: 'The resource you requested could not be found.',
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
