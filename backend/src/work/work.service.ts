import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { QueryWorkDto } from './dto/query-work.dto';

@Injectable()
export class WorkService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(userId: number, dto: CreateWorkDto) {
    const tagsData = dto.tags?.length
      ? { tags: { connectOrCreate: dto.tags.map((name) => ({ where: { name }, create: { name } })) } }
      : {};

    const work = await this.prisma.work.create({
      data: { name: dto.name, type: dto.type, rating: dto.rating, cover: dto.cover, description: dto.description, url: dto.url, author_id: userId, ...tagsData },
      include: { tags: true, author: { select: { id: true, nickname: true, avatar: true } } },
    });
    return this.appendCoverUrl(work);
  }

  async findAll(query: QueryWorkDto) {
    const limit = query.limit || 20;
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.authorId) where.author_id = query.authorId;
    if (query.search) where.name = { contains: query.search };
    if (query.tag) where.tags = { some: { name: query.tag } };
    if (query.cursor) where.id = { lt: query.cursor };

    const orderBy: any = {};
    orderBy[query.sortBy || 'created_at'] = query.sortOrder || 'desc';

    const works = await this.prisma.work.findMany({
      where, orderBy, take: limit,
      include: { tags: true, author: { select: { id: true, nickname: true, avatar: true } } },
    });
    const nextCursor = works.length === limit ? works[works.length - 1].id : null;
    return { works: works.map((w) => this.appendCoverUrl(w)), nextCursor };
  }

  async findOne(id: number) {
    const work = await this.prisma.work.findUnique({
      where: { id },
      include: { tags: true, author: { select: { id: true, nickname: true, avatar: true } } },
    });
    if (!work) throw new HttpException('作品不存在', HttpStatus.NOT_FOUND);

    const result = this.appendCoverUrl(work) as any;

    // Convert episode image keys to URLs
    if (work.detail_content && (work.detail_content as any).episodes) {
      const dc = work.detail_content as any;
      dc.episodes = dc.episodes.map((ep: any) => ({
        ...ep,
        images: ep.images?.map((key: string) => this.uploadService.getPublicUrl(key)) || [],
      }));
      result.detail_content = dc;
    }

    // Fetch related works
    if (work.detail_content && (work.detail_content as any).related_work_ids?.length) {
      const relatedIds = (work.detail_content as any).related_work_ids;
      const relatedWorks = await this.prisma.work.findMany({
        where: { id: { in: relatedIds } },
        select: { id: true, name: true, type: true, cover: true, rating: true, description: true },
      });
      result.related_works = relatedWorks.map((rw) => ({
        ...rw,
        cover_url: this.uploadService.getPublicUrl(rw.cover),
      }));
    }

    return result;
  }

  async update(userId: number, id: number, dto: UpdateWorkDto) {
    const work = await this.prisma.work.findUnique({ where: { id } });
    if (!work) throw new HttpException('作品不存在', HttpStatus.NOT_FOUND);
    if (work.author_id !== userId) throw new HttpException('无权编辑此作品', HttpStatus.FORBIDDEN);

    // Validate detail_content structure
    if (dto.detail_content) {
      this.validateDetailContent(dto.detail_content);
    }

    const { tags, ...rest } = dto;
    const updateData: any = { ...rest };
    if (tags !== undefined) {
      updateData.tags = { set: [], connectOrCreate: tags.map((name) => ({ where: { name }, create: { name } })) };
    }

    const updated = await this.prisma.work.update({
      where: { id }, data: updateData,
      include: { tags: true, author: { select: { id: true, nickname: true, avatar: true } } },
    });
    return this.appendCoverUrl(updated);
  }

  async remove(userId: number, id: number) {
    const work = await this.prisma.work.findUnique({ where: { id } });
    if (!work) throw new HttpException('作品不存在', HttpStatus.NOT_FOUND);
    if (work.author_id !== userId) throw new HttpException('无权删除此作品', HttpStatus.FORBIDDEN);
    await this.prisma.work.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async findAllTags() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async searchWorks(search: string, limit = 10) {
    return this.prisma.work.findMany({
      where: { name: { contains: search } },
      take: limit,
      select: { id: true, name: true, type: true, cover: true, rating: true },
    });
  }

  private validateDetailContent(dc: any) {
    if (dc.episodes && Array.isArray(dc.episodes)) {
      if (dc.episodes.length > 100) throw new HttpException('单集介绍最多100条', HttpStatus.BAD_REQUEST);
      for (const ep of dc.episodes) {
        if (typeof ep.number !== 'number' || !ep.title) {
          throw new HttpException('单集介绍格式错误', HttpStatus.BAD_REQUEST);
        }
        if (ep.images && ep.images.length > 10) {
          throw new HttpException('每集最多10张图片', HttpStatus.BAD_REQUEST);
        }
      }
    }
    if (dc.related_work_ids && dc.related_work_ids.length > 20) {
      throw new HttpException('关联作品最多20个', HttpStatus.BAD_REQUEST);
    }
  }

  private appendCoverUrl(work: any) {
    return { ...work, cover_url: this.uploadService.getPublicUrl(work.cover) };
  }
}
