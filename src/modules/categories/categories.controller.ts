import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { GetCategoryDto } from './dto/getCategory.dto';
import { FilterCategoriesDto } from './dto/filterCategories.dto';
import { UpdateCategoryPipe } from './pipes/updateCategory.pipe';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(body);
    return { id: category.id };
  }

  @Patch('/:uuid')
  async update(
    @Body(UpdateCategoryPipe) body: UpdateCategoryDto,
    @Param('uuid', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    const updateResult = await this.categoriesService.updateCategory(id, body);
    if (updateResult.affected === 0) {
      throw new NotFoundException(
        `Категория с id ${id} не была изменена, т.к. ее не существует`,
      );
    }
  }

  @Delete('/:uuid')
  async delete(@Param('uuid', new ParseUUIDPipe()) id: string) {
    const deleteResult = await this.categoriesService.deleteCategory(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(
        `Категория с id ${id} не была удалена, т.к. ее не существует`,
      );
    }
  }

  @Get('/')
  async getCategoriesList(@Query() params: FilterCategoriesDto) {
    return this.categoriesService.find(params);
  }

  @Get('/category')
  async getCategory(@Query() params: GetCategoryDto) {
    return this.categoriesService.findOne(params);
  }
}
