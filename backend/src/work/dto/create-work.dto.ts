import { IsString, IsNumber, IsOptional, IsArray, Min, Max, IsUrl, IsIn } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['movie', 'series', 'anime'])
  type: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  cover: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
