import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(userId: number, postId: number, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new HttpException('帖子不存在', HttpStatus.NOT_FOUND);
    const comment = await this.prisma.comment.create({
      data: { content: dto.content, post_id: postId, author_id: userId },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
    return this.appendAvatarUrl(comment);
  }

  async findByPost(postId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { post_id: postId }, orderBy: { created_at: 'asc' },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
    return comments.map((c) => this.appendAvatarUrl(c));
  }

  private appendAvatarUrl(comment: any) {
    return {
      ...comment,
      author: {
        ...comment.author,
        avatar_url: comment.author.avatar ? this.uploadService.getPublicUrl(comment.author.avatar) : null,
      },
    };
  }
}
