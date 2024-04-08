import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetCategoryDto, SearchFields } from '../dto/getCategory.dto';
import { ENGLISH_INPUT_REGEX, SLUG_MESSAGE } from '../categories.constants';

const isUuid = (value: string) =>
  Boolean(
    value.match(
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    ),
  );

@ValidatorConstraint({ name: 'GetCategoryValueValidator', async: true })
@Injectable()
export class GetCategoryValueValidator implements ValidatorConstraintInterface {
  async validate(
    name: string,
    validationArguments: ValidationArguments,
  ): Promise<boolean> {
    const { value, field } = validationArguments.object as GetCategoryDto;

    if (field === SearchFields.ID && !isUuid(value)) {
      throw new BadRequestException('value должно иметь формат uuid');
    }
    if (field === SearchFields.SLUG && !ENGLISH_INPUT_REGEX.test(value)) {
      throw new BadRequestException(SLUG_MESSAGE);
    }

    return true;
  }
}
