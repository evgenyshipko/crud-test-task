import { IsEnum, IsString, Validate } from 'class-validator';
import { GetCategoryValueValidator } from '../validators/getCategory.validator';

export enum SearchFields {
  ID = 'id',
  SLUG = 'slug',
}

export class GetCategoryDto {
  @IsEnum(Object.values(SearchFields))
  field: SearchFields;

  @Validate(GetCategoryValueValidator)
  @IsString()
  value: string;
}
