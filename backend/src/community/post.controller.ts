import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@Controller()
export class PostController {
  constructor(private postService: PostService, private commentService: CommentService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  createPost(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postService.create(req.user.userId, dto);
  }

  @Get('posts')
  findAllPosts(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.postService.findAll(cursor ? +cursor : undefined, limit ? +limit : 20);
  }

  @Get('posts/:id')
  @UseGuards(OptionalAuthGuard)
  findOnePost(@Param('id') id: string, @Req() req: any) {
    return this.postService.findOne(+id, req.user?.userId);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  removePost(@Req() req: any, @Param('id') id: string) {
    return this.postService.remove(req.user.userId, +id);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  createComment(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.commentService.create(req.user.userId, +id, dto);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Req() req: any, @Param('id') id: string) {
    return this.postService.toggleLike(req.user.userId, +id);
  }

  @Post('posts/:id/favorite')
  @UseGuards(JwtAuthGuard)
  toggleFavorite(@Req() req: any, @Param('id') id: string) {
    return this.postService.toggleFavorite(req.user.userId, +id);
  }
}
