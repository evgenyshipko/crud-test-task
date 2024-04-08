import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { IsSlugAlreadyExistsValidator } from '../validators/slug.validator';
import { Type } from 'class-transformer';
import { ENGLISH_INPUT_REGEX, SLUG_MESSAGE } from '../categories.constants';

export class UpdateCategoryDto {
  @Validate(IsSlugAlreadyExistsValidator)
  @Matches(ENGLISH_INPUT_REGEX, {
    message: SLUG_MESSAGE,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdDate?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
