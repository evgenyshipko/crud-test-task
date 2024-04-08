/* eslint-disable */
import dataSource from '../ormconfig';
import CreateCategoriesSeeder from './seeds/1-categories.seed';
import ClearTablesSeeder from './seeds/0-clear.seed';

(async () => {
  try {
    await dataSource.initialize();

    const seeders = [ClearTablesSeeder, CreateCategoriesSeeder];

    for (const seeder of seeders) {
      await new seeder().run(dataSource.manager);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
