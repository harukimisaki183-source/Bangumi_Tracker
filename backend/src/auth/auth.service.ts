import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', 'smtp.qq.com'),
      port: configService.get<number>('SMTP_PORT', 465),
      secure: true,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationCode(email: string) {
    const rateLimitKey = `ratelimit:verify:${email}`;
    const existing = await this.redis.get(rateLimitKey);
    if (existing) {
      throw new HttpException('验证码发送过于频繁，请60秒后再试', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`verify:${email}`, code, 300);

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: '【追番记录站】邮箱验证码',
        html: `<p>您的验证码为：<strong>${code}</strong>，5分钟内有效。</p>`,
      });
    } catch (error) {
      await this.redis.del(`verify:${email}`);
      console.error('Failed to send email:', error);
      throw new HttpException('邮件发送失败，请稍后再试', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.redis.set(rateLimitKey, '1', 60);

    return { message: '验证码已发送' };
  }

  async register(dto: RegisterDto) {
    const codeKey = `verify:${dto.email}`;
    const storedCode = await this.redis.get(codeKey);
    if (!storedCode || storedCode !== dto.code) {
      throw new HttpException('验证码错误或已过期', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new HttpException('该邮箱已被注册', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nickname: dto.email.split('@')[0],
      },
    });

    await this.redis.del(codeKey);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new HttpException('邮箱或密码错误', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new HttpException('邮箱或密码错误', HttpStatus.UNAUTHORIZED);
    }

    return this.generateTokens(user);
  }

  async refresh(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.UNAUTHORIZED);
    }
    return this.generateTokens(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const codeKey = `verify:${dto.email}`;
    const storedCode = await this.redis.get(codeKey);
    if (!storedCode || storedCode !== dto.code) {
      throw new HttpException('验证码错误或已过期', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new HttpException('该邮箱未注册', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    });

    await this.redis.del(codeKey);
    return { message: '密码重置成功' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new HttpException('原密码错误', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  private async generateTokens(user: { id: number; email: string; nickname: string | null; avatar: string | null }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    await this.redis.set(`refresh:${refreshToken}`, user.id.toString(), 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }
}
