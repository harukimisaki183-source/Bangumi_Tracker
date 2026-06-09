import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { NotificationService } from './notification.service';
import { PostController } from './post.controller';
import { NotificationController } from './notification.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [PostController, NotificationController],
  providers: [PostService, CommentService, NotificationService],
})
export class CommunityModule {}
