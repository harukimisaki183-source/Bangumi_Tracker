import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @Length(6, 6, { message: '验证码为6位数字' })
  code: string;

  @IsString()
  @MinLength(8, { message: '密码至少需要8个字符' })
  newPassword: string;
}
