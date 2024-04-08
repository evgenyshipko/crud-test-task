import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as process from 'process';

dotenv.config();

export const POSTGRES_CONNECTION_OPTIONS: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  logging: process.env.IS_E2E_TEST ? false : ['query', 'error'],
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
  synchronize: false,
  migrationsTransactionMode: 'each',
  namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource(POSTGRES_CONNECTION_OPTIONS);
