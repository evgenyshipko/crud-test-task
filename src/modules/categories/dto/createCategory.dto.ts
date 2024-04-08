import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { IsSlugAlreadyExistsValidator } from '../validators/slug.validator';
import { ENGLISH_INPUT_REGEX, SLUG_MESSAGE } from '../categories.constants';

export class CreateCategoryDto {
  @Validate(IsSlugAlreadyExistsValidator)
  @Matches(ENGLISH_INPUT_REGEX, {
    message: SLUG_MESSAGE,
  })
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  active: boolean;
}
