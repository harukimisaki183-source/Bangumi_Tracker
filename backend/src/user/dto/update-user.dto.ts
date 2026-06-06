import { IsString, IsOptional, IsNumber, IsBoolean, IsIn, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() nickname?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() @IsIn(['male', 'female', 'other']) gender?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(150) age?: number;
  @IsOptional() @IsBoolean() privacy_age?: boolean;
  @IsOptional() @IsBoolean() privacy_gender?: boolean;
}
