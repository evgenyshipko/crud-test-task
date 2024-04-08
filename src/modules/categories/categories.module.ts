import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { IsSlugAlreadyExistsValidator } from './validators/slug.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CategoryEntity } from '../../entities/category.entity';
import { GetCategoryValueValidator } from './validators/getCategory.validator';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    IsSlugAlreadyExistsValidator,
    GetCategoryValueValidator,
  ],
})
export class CategoriesModule {}
