import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { PostController } from './post.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [PostController],
  providers: [PostService, CommentService],
})
export class CommunityModule {}
