import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: number, cursor?: number, limit = 20) {
    const where: any = { user_id: userId };
    if (cursor) where.id = { lt: cursor };
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, nickname: true } }, post: { select: { id: true, content: true } } },
    });
    const nextCursor = notifications.length === limit ? notifications[notifications.length - 1].id : null;
    return { notifications, nextCursor };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({ where: { user_id: userId, is_read: false } });
    return { count };
  }

  async markAsRead(userId: number, notificationId: number) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }

  async createLikeNotification(likerId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true } } },
    });
    if (!post || post.author_id === likerId) return;
    const liker = await this.prisma.user.findUnique({ where: { id: likerId }, select: { nickname: true } });
    const snippet = post.content.length > 20 ? post.content.slice(0, 20) + '...' : post.content;
    await this.prisma.notification.create({
      data: {
        user_id: post.author_id,
        type: 'like',
        message: `"${snippet}" 收到一个新点赞！来自 ${liker?.nickname || '匿名用户'}`,
        post_id: postId,
        actor_id: likerId,
      },
    });
  }

  async createCommentNotification(commenterId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true } } },
    });
    if (!post || post.author_id === commenterId) return;
    const commenter = await this.prisma.user.findUnique({ where: { id: commenterId }, select: { nickname: true } });
    const snippet = post.content.length > 20 ? post.content.slice(0, 20) + '...' : post.content;
    await this.prisma.notification.create({
      data: {
        user_id: post.author_id,
        type: 'comment',
        message: `"${snippet}" 收到一条新评论！来自 ${commenter?.nickname || '匿名用户'}`,
        post_id: postId,
        actor_id: commenterId,
      },
    });
  }
}
