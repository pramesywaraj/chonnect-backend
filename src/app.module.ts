import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import CommonModule from './common/common.module';
import FeaturesModule from './modules/features.module';

@Module({
  imports: [CommonModule, FeaturesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
