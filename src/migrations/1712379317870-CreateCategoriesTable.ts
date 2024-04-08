import { MigrationInterface, QueryRunner } from 'typeorm';
import { ENGLISH_INPUT_REGEX } from '../modules/categories/categories.constants';

export class CreateCategoriesTable1712379317870 implements MigrationInterface {
  name = 'CreateCategoriesTable1712379317870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL CHECK (slug ~ '${ENGLISH_INPUT_REGEX.source}'), "name" character varying NOT NULL, "description" character varying, "created_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "active" boolean NOT NULL, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
