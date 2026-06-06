import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, postId: number, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new HttpException('帖子不存在', HttpStatus.NOT_FOUND);
    return this.prisma.comment.create({
      data: { content: dto.content, post_id: postId, author_id: userId },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
  }

  async findByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { post_id: postId }, orderBy: { created_at: 'asc' },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
  }
}
