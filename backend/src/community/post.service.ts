import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService, private uploadService: UploadService) {}

  async create(userId: number, dto: CreatePostDto) {
    if (dto.images && dto.images.length > 9) throw new HttpException('最多上传9张图片', HttpStatus.BAD_REQUEST);
    return this.prisma.post.create({
      data: { content: dto.content, images: dto.images || [], author_id: userId },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
  }

  async findAll(cursor?: number, limit = 20) {
    const where: any = {};
    if (cursor) where.id = { lt: cursor };
    const posts = await this.prisma.post.findMany({
      where, orderBy: { created_at: 'desc' }, take: limit,
      include: { author: { select: { id: true, nickname: true, avatar: true } }, _count: { select: { comments: true, likes: true, favorites: true } } },
    });
    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
    return { posts: posts.map((p) => this.appendImageUrls(p)), nextCursor };
  }

  async findOne(id: number, userId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, nickname: true, avatar: true } }, comments: { include: { author: { select: { id: true, nickname: true, avatar: true } } }, orderBy: { created_at: 'asc' } }, _count: { select: { likes: true, favorites: true } } },
    });
    if (!post) throw new HttpException('帖子不存在', HttpStatus.NOT_FOUND);
    const result: any = this.appendImageUrls(post);
    if (userId) {
      result.isLiked = !!(await this.prisma.like.findUnique({ where: { user_id_post_id: { user_id: userId, post_id: id } } }));
      result.isFavorited = !!(await this.prisma.favorite.findUnique({ where: { user_id_post_id: { user_id: userId, post_id: id } } }));
    }
    return result;
  }

  async remove(userId: number, id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new HttpException('帖子不存在', HttpStatus.NOT_FOUND);
    if (post.author_id !== userId) throw new HttpException('无权删除', HttpStatus.FORBIDDEN);
    await this.prisma.post.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async toggleLike(userId: number, postId: number) {
    const existing = await this.prisma.like.findUnique({ where: { user_id_post_id: { user_id: userId, post_id: postId } } });
    if (existing) { await this.prisma.like.delete({ where: { id: existing.id } }); return { liked: false }; }
    await this.prisma.like.create({ data: { user_id: userId, post_id: postId } });
    return { liked: true };
  }

  async toggleFavorite(userId: number, postId: number) {
    const existing = await this.prisma.favorite.findUnique({ where: { user_id_post_id: { user_id: userId, post_id: postId } } });
    if (existing) { await this.prisma.favorite.delete({ where: { id: existing.id } }); return { favorited: false }; }
    await this.prisma.favorite.create({ data: { user_id: userId, post_id: postId } });
    return { favorited: true };
  }

  async findByUser(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({ where: { author_id: userId }, orderBy: { created_at: 'desc' }, skip, take: limit, include: { author: { select: { id: true, nickname: true, avatar: true } }, _count: { select: { comments: true, likes: true, favorites: true } } } }),
      this.prisma.post.count({ where: { author_id: userId } }),
    ]);
    return { posts: posts.map((p) => this.appendImageUrls(p)), total, page, totalPages: Math.ceil(total / limit) };
  }

  private appendImageUrls(post: any) {
    if (post.images && Array.isArray(post.images)) post.image_urls = post.images.map((key) => this.uploadService.getPublicUrl(key));
    return post;
  }
}
