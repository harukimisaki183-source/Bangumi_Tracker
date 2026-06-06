import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UploadModule } from './upload/upload.module';
import { WorkModule } from './work/work.module';
import { CommunityModule } from './community/community.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    HealthModule,
    UploadModule,
    WorkModule,
    CommunityModule,
    UserModule,
  ],
})
export class AppModule {}
