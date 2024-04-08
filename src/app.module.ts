import { Module } from '@nestjs/common';
import { CategoriesModule } from './modules/categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES_CONNECTION_OPTIONS } from './ormconfig';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forRoot({
      ...POSTGRES_CONNECTION_OPTIONS,
      retryAttempts: 5,
      retryDelay: 30000,
    }),
  ],
})
export class AppModule {}
