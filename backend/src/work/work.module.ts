import { Module } from '@nestjs/common';
import { WorkService } from './work.service';
import { WorkController } from './work.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [WorkController],
  providers: [WorkService],
  exports: [WorkService],
})
export class WorkModule {}
