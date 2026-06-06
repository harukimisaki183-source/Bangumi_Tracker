import { Controller, Get, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.userService.getProfile(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @Get('me/posts')
  @UseGuards(JwtAuthGuard)
  getMyPosts(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getMyPosts(req.user.userId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('me/works')
  @UseGuards(JwtAuthGuard)
  getMyWorks(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getMyWorks(req.user.userId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(+id);
  }
}
