import { IsOptional, IsString, IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWorkDto {
  @IsOptional()
  @IsString()
  @IsIn(['movie', 'series', 'anime'])
  type?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['rating', 'created_at', 'name'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;
}
