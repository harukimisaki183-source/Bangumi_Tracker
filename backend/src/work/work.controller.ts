import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { QueryWorkDto } from './dto/query-work.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('works')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateWorkDto) {
    return this.workService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Query() query: QueryWorkDto) {
    return this.workService.findAll(query);
  }

  @Get('tags')
  findAllTags() {
    return this.workService.findAllTags();
  }

  @Get('search')
  search(@Query('q') q: string) {
    if (!q) return [];
    return this.workService.searchWorks(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWorkDto) {
    return this.workService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.workService.remove(req.user.userId, +id);
  }
}
