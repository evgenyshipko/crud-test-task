import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const trimTransformFunc = ({ value }) => value.trim();
export class FilterCategoriesDto {
  @Transform(trimTransformFunc)
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(trimTransformFunc)
  @IsString()
  @IsOptional()
  description?: string;

  @Transform(trimTransformFunc)
  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (['0', 'false'].includes(value)) {
      return false;
    }
    if (['1', 'true'].includes(value)) {
      return true;
    }
    return value;
  })
  @IsOptional()
  active?: boolean;

  @Min(1)
  @Max(9)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 2;

  @Transform(({ value }) => (value === 0 ? 1 : value))
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @Transform(trimTransformFunc)
  @IsString()
  @IsOptional()
  sort?: string;
}
