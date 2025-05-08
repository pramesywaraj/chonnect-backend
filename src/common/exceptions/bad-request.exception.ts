import { HttpException, HttpStatus } from '@nestjs/common';

export default class BadRequestError extends HttpException {
  constructor(messages: string | string[]) {
    if (typeof messages === 'string') {
      messages = [messages];
    }

    super(
      {
        title: 'Bad Request',
        status_code: HttpStatus.BAD_REQUEST,
        message: 'The request could not be processed. Please check your input and try again!',
        errors: messages.map((message) => ({ message })),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
