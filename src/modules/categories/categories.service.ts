import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { GetCategoryDto } from './dto/getCategory.dto';
import { FilterCategoriesDto } from './dto/filterCategories.dto';
import { snakeCase } from 'typeorm/util/StringUtils';

enum SortField {
  ACTIVE = 'active',
  CREATED_DATE = 'createdDate',
  NAME = 'name',
  DESCRIPTION = 'description',
}

enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createCategory(data: CreateCategoryDto) {
    const categoryEntity = this.categoryRepository.create(data);
    await this.categoryRepository.save(categoryEntity);
    return categoryEntity;
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    return this.categoryRepository.delete(id);
  }

  async findOne({ field, value }: GetCategoryDto) {
    return this.categoryRepository.findOne({ where: { [field]: value } });
  }

  async find({
    active,
    sort,
    page,
    pageSize,
    search,
    name,
    description,
  }: FilterCategoriesDto) {
    let sortDirection = SortDirection.DESC;
    let sortField = SortField.CREATED_DATE;

    const sortFields = Object.values(SortField) as string[];

    if (sort && sort[0] === '-' && sortFields.includes(sort.substring(1))) {
      sortDirection = SortDirection.DESC;
      sortField = sort.substring(1) as SortField;
    } else if (sort && sortFields.includes(sort)) {
      sortDirection = SortDirection.ASC;
      sortField = sort as SortField;
    }

    const getRegexp = (str) =>
      new RegExp('^' + str.replace(/[её]/g, '[её]')).source;

    const offset =
      page && pageSize ? Math.round((page - 1) * pageSize) : undefined;

    const qb = this.categoryRepository
      .createQueryBuilder()
      .offset(offset)
      .limit(pageSize);

    if (search) {
      qb.andWhere(`name ~* :regex OR description ~* :regex`, {
        regex: getRegexp(search),
      });
    } else {
      if (name) {
        qb.andWhere(`name ~* :regex`, { regex: getRegexp(name) });
      }
      if (description) {
        qb.andWhere(`description ~* :regex`, {
          regex: getRegexp(description),
        });
      }
    }

    if (sortField && sortDirection) {
      qb.orderBy(snakeCase(sortField), sortDirection);
    }

    if (active !== undefined) {
      qb.andWhere(`active = :active`, { active });
    }

    return qb.getMany();
  }
}
