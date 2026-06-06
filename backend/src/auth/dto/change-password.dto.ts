import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8, { message: '新密码至少需要8个字符' })
  newPassword: string;
}
