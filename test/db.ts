import { DataSource, EntityTarget, Repository } from 'typeorm';
import { POSTGRES_CONNECTION_OPTIONS } from '../src/ormconfig';

let antaresPostgresDataSource: DataSource;
export const initDbConnection = async () => {
  antaresPostgresDataSource = new DataSource(POSTGRES_CONNECTION_OPTIONS);
  await antaresPostgresDataSource.initialize();
};

export const closeDbConnection = async () => {
  await antaresPostgresDataSource?.destroy();
  antaresPostgresDataSource = undefined;
};

export const getDbRepository = <T>(
  classProp: EntityTarget<T>,
): Repository<T> => {
  if (!antaresPostgresDataSource) {
    throw new Error('antaresPostgresConnection is not opened');
  }

  return antaresPostgresDataSource?.getRepository(classProp);
};
