import { SetMetadata } from '@nestjs/common';

export const SUCCESS_MESSAGE = 'success_message';

const SuccessMessage = (message: string) => SetMetadata(SUCCESS_MESSAGE, message);

export default SuccessMessage;
