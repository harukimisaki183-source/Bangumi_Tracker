import { Controller, Get, Post, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }
    return this.uploadService.uploadFile(file);
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query('filename') filename: string, @Query('contentType') contentType: string) {
    if (!filename || !contentType) {
      throw new BadRequestException('filename and contentType are required');
    }
    return this.uploadService.getPresignedUrl(filename, contentType);
  }

  @Get('file-url')
  async getFileUrl(@Query('key') key: string) {
    return { url: this.uploadService.getPublicUrl(key) };
  }
}
