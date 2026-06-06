import { IsString, IsOptional, IsArray, IsNumber, ValidateNested, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class BasicInfoDto {
  @IsOptional() @IsString() director?: string;
  @IsOptional() @IsString() studio?: string;
  @IsOptional() @IsString() airDate?: string;
  @IsOptional() @IsString() episodes?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() actors?: string;
  @IsOptional() @IsString() characters?: string;
  [key: string]: string | undefined;
}

class EpisodeDto {
  @IsNumber() number: number;
  @IsString() title: string;
  @IsString() note: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
}

class RatingReasonDto {
  @IsNumber() @Max(5) rating: number;
  @IsString() reason: string;
}

export class DetailContentDto {
  @IsOptional() @ValidateNested() @Type(() => BasicInfoDto)
  basic_info?: BasicInfoDto;

  @IsOptional() @ValidateNested() @Type(() => RatingReasonDto)
  rating_reason?: RatingReasonDto;

  @IsOptional() @IsString()
  synopsis?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EpisodeDto)
  episodes?: EpisodeDto[];

  @IsOptional() @IsString()
  production_background?: string;

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  related_work_ids?: number[];
}
