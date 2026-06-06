import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private uploadService: UploadService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nickname: true, avatar: true, gender: true, age: true, privacy_age: true, privacy_gender: true, created_at: true },
    });
    if (!user) throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    return user;
  }

  async getPublicProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, avatar: true, gender: true, age: true, privacy_age: true, privacy_gender: true, created_at: true },
    });
    if (!user) throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    return {
      id: user.id, nickname: user.nickname, avatar: user.avatar,
      gender: user.privacy_gender ? null : user.gender,
      age: user.privacy_age ? null : user.age,
      created_at: user.created_at,
    };
  }

  async updateProfile(userId: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto,
      select: { id: true, email: true, nickname: true, avatar: true, gender: true, age: true, privacy_age: true, privacy_gender: true },
    });
  }

  async getMyPosts(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { author_id: userId }, orderBy: { created_at: 'desc' }, skip, take: limit,
        include: { author: { select: { id: true, nickname: true, avatar: true } }, _count: { select: { comments: true, likes: true, favorites: true } } },
      }),
      this.prisma.post.count({ where: { author_id: userId } }),
    ]);
    return { posts: posts.map((p) => this.appendImageUrls(p)), total, page, totalPages: Math.ceil(total / limit) };
  }

  async getMyWorks(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [works, total] = await Promise.all([
      this.prisma.work.findMany({
        where: { author_id: userId }, orderBy: { created_at: 'desc' }, skip, take: limit,
        include: { tags: true },
      }),
      this.prisma.work.count({ where: { author_id: userId } }),
    ]);
    return { works: works.map((w) => ({ ...w, cover_url: this.uploadService.getPublicUrl(w.cover) })), total, page, totalPages: Math.ceil(total / limit) };
  }

  private appendImageUrls(post: any) {
    if (post.images && Array.isArray(post.images)) post.image_urls = post.images.map((key) => this.uploadService.getPublicUrl(key));
    return post;
  }
}
