import { EntityManager } from 'typeorm';
import { CategoryEntity } from '../../entities/category.entity';
import { Seeder } from '../seeder';

export default class ClearTables implements Seeder {
  public async run(manager: EntityManager) {
    await manager.delete(CategoryEntity, {});
  }
}
