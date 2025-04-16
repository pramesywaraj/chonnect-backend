import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CustomLogger } from './common/logger/custom-logger.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new CustomLogger();

  @Get()
  getHello(): string {
    this.logger.log('Greetings from the API...', 'AppController');
    return this.appService.getHello();
  }
}
