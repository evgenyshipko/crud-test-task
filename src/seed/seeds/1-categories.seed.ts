import { EntityManager } from 'typeorm';
import tables from '../data';
import { CategoryEntity } from '../../entities/category.entity';
import { Seeder } from '../seeder';

export default class CreateCategoriesSeeder implements Seeder {
  public async run(manager: EntityManager) {
    await manager.insert(CategoryEntity, tables.categories);
  }
}
