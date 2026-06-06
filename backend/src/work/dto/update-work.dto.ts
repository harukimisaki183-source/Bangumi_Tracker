import { IsString, IsNumber, IsOptional, IsArray, Min, Max, IsIn } from 'class-validator';

export class UpdateWorkDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['movie', 'series', 'anime'])
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  cover?: string;

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

  @IsOptional()
  detail_content?: any;
}
