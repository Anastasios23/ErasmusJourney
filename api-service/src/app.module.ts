import { Module } from '@nestjs/common';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AdminModule, AuthModule, DestinationsModule, SubmissionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
