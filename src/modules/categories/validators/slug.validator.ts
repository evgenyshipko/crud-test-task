import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../../entities/category.entity';

@ValidatorConstraint({ name: 'IsSlugAlreadyExistsValidator', async: true })
@Injectable()
export class IsSlugAlreadyExistsValidator
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async validate(
    name: string,
    validationArguments: ValidationArguments,
  ): Promise<boolean> {
    const { slug } = validationArguments.object as { slug: string };

    const categories = await this.categoryRepository.find({ where: { slug } });
    return categories.length === 0;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Категория с параметром slug "${validationArguments.value}" уже существует.`;
  }
}
