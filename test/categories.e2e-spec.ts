import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setAppConfig } from '../src/appconfig';

import { exec } from 'child_process';
import { closeDbConnection, getDbRepository, initDbConnection } from './db';
import { CategoryEntity } from '../src/entities/category.entity';
import { SLUG_MESSAGE } from '../src/modules/categories/categories.constants';
import { SearchFields } from '../src/modules/categories/dto/getCategory.dto';
import { isUUID } from 'class-validator';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let httpTransport: request.SuperTest<request.Test>;

  const runSeed = () =>
    new Promise((resolve, reject) => {
      exec('npm run seed', (error) => {
        if (error) {
          reject(error);
        }
        resolve('finished');
      });
    });

  const repo = () => getDbRepository(CategoryEntity);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    setAppConfig(app);

    await app.init();

    httpTransport = request(app.getHttpServer());
  });

  beforeAll(initDbConnection);

  afterAll(closeDbConnection);

  describe('Создание категории (POST /)', () => {
    beforeEach(runSeed);
    const requestBuilder = () => httpTransport.post('/api/categories/');

    it('Пытаемся создать категорию без url-параметров => получаем 400', () => {
      return requestBuilder().expect(HttpStatus.BAD_REQUEST);
    });

    it('В query-параметрах должны присутствовать slug, name, active. Необязательное поле - description', async () => {
      // параметров не хватает - получаем 400
      await requestBuilder()
        .send({ slug: 'ghghg' })
        .expect(HttpStatus.BAD_REQUEST);

      // параметров не хватает - получаем 400
      await requestBuilder()
        .send({ slug: 'ghghg', name: 'azaza' })
        .expect(HttpStatus.BAD_REQUEST);

      // параметров хватает - получаем 201
      await requestBuilder()
        .send({
          slug: 'ghghgf',
          name: 'azaza',
          active: false,
          description: 'azaza',
        })
        .expect(HttpStatus.CREATED);
    });

    it('Пытаемся создать категорию с уже существующим slug => получаем 400', async () => {
      const slug = 'first';

      const resp = await requestBuilder()
        .send({
          slug,
          name: 'azaza',
          active: false,
          description: 'azaza',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(resp.body.message[0]).toEqual(
        `Категория с параметром slug "${slug}" уже существует.`,
      );
    });

    it('Пытаемся передать slug кириллицей => получаем 400', async () => {
      const resp = await requestBuilder()
        .send({
          slug: 'привет',
          name: 'azaza',
          active: false,
          description: 'azaza',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(resp.body.message[0]).toEqual(SLUG_MESSAGE);
    });

    it('Создаем категорию => она появилась в БД', async () => {
      const startCount = await repo().count();

      const resp = await requestBuilder()
        .send({
          slug: 'prprprprp',
          name: 'azaza',
          active: false,
          description: 'azaza',
        })
        .expect(HttpStatus.CREATED);

      expect(isUUID(resp.body.id)).toEqual(true);

      const categoryId = resp.body.id;

      const endCount = await repo().count();

      expect(endCount - startCount).toEqual(1);

      const category = await repo().findOne({ where: { id: categoryId } });

      expect(category).not.toBeNull();
      expect(category.id).toEqual(categoryId);
    });
  });

  describe('Получение категории (GET /category)', () => {
    const requestBuilder = (str = '') =>
      httpTransport.get('/api/categories/category/' + str);

    it('Пытаемся получить категорию без обязательных url-параметров => получаем 400', async () => {
      await requestBuilder().expect(HttpStatus.BAD_REQUEST);

      await requestBuilder('?value=&field=').expect(HttpStatus.BAD_REQUEST);

      await requestBuilder()
        .query({ id: SearchFields.ID })
        .expect(HttpStatus.BAD_REQUEST);

      await requestBuilder()
        .query({ value: 'abc' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Значение field принимает только id, slug => в противном случае получаем 400', async () => {
      await requestBuilder()
        .query({
          field: 'xvxvxv',
          value: '86713e06-5de0-4ac3-ba09-9ad13592cc17',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await requestBuilder()
        .query({
          field: SearchFields.ID,
          value: '86713e06-5de0-4ac3-ba09-9ad13592cc17',
        })
        .expect(HttpStatus.OK);

      await requestBuilder()
        .query({
          field: SearchFields.SLUG,
          value: 'sluuug',
        })
        .expect(HttpStatus.OK);
    });

    describe('Поиск по id', () => {
      it('При field=id value должен быть типа uuid => в противном случае получаем 400', async () => {
        const resp = await requestBuilder()
          .query({
            field: SearchFields.ID,
            value: 'aaa',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(resp.body.message).toEqual('value должно иметь формат uuid');

        await requestBuilder()
          .query({
            field: SearchFields.ID,
            value: '86713e06-5de0-4ac3-ba09-9ad13592cc17',
          })
          .expect(HttpStatus.OK);
      });

      it('Ищем по id, которого нет в БД => получаем пустой объект', async () => {
        const resp = await requestBuilder()
          .query({
            field: SearchFields.ID,
            value: '13eeec07-00e0-4224-aeff-78740212623b',
          })
          .expect(HttpStatus.OK);

        expect(resp.body).toEqual({});
      });

      it('Ищем по id, который есть в БД => данные ответа совпадают с поиковыми', async () => {
        const id = '86713e06-5de0-4ac3-ba09-9ad13592cc17';

        const resp = await requestBuilder()
          .query({
            field: SearchFields.ID,
            value: id,
          })
          .expect(HttpStatus.OK);

        // преобразовываем строковую дату т.к. в респонсе приходит строка, а в модели хранится дата
        resp.body.createdDate = new Date(resp.body.createdDate);

        const categoryFromDb = await repo().findOne({ where: { id } });

        expect(resp.body.id).toEqual(id);
        expect(resp.body).toEqual(categoryFromDb);
      });
    });

    describe('Поиск по slug', () => {
      it('Ищем по slug, которого нет в БД => получаем пустой объект', async () => {
        const resp = await requestBuilder()
          .query({
            field: SearchFields.SLUG,
            value: 'azazazazaz',
          })
          .expect(HttpStatus.OK);

        expect(resp.body).toEqual({});
      });

      it('Передаем slug кириллицей => получаем 400', async () => {
        const resp = await requestBuilder()
          .query({
            field: SearchFields.SLUG,
            value: 'привет',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(resp.body.message).toEqual(SLUG_MESSAGE);
      });

      it('Ищем по slug, который есть в БД => данные ответа совпдают с поисковыми', async () => {
        const slug = 'first';

        const resp = await requestBuilder()
          .query({
            field: SearchFields.SLUG,
            value: slug,
          })
          .expect(HttpStatus.OK);

        // преобразовываем строковую дату т.к. в респонсе приходит строка, а в модели хранится дата
        resp.body.createdDate = new Date(resp.body.createdDate);

        const categoryFromDb = await repo().findOne({ where: { slug } });

        expect(resp.body.slug).toEqual(slug);
        expect(resp.body).toEqual(categoryFromDb);
      });
    });
  });

  describe('Удаление категории (DELETE /:categoryId)', () => {
    const requestBuilder = (id: string) =>
      httpTransport.delete('/api/categories/' + id);

    it('Дергаем ручку без id => получаем 404', async () => {
      return requestBuilder('').expect(HttpStatus.NOT_FOUND);
    });

    it('В ссылке неверный формат id => получаем 400', async () => {
      return requestBuilder('4546dggd').expect(HttpStatus.BAD_REQUEST);
    });

    it('Пытаемся удалить несуществуюущую категорию => получаем 404', async () => {
      return requestBuilder('1e05a878-ab63-4546-86e8-6fbd2b903d80').expect(
        HttpStatus.NOT_FOUND,
      );
    });

    it('Удаляем существующую категорию => получаем 200, в базе она отсутствует', async () => {
      const categoryId = '41d36d01-3d06-48ec-90ea-735d95d8a1f2';

      const category = await repo().findOne({ where: { id: categoryId } });

      expect(category.id).toEqual(categoryId);

      await requestBuilder(categoryId).expect(HttpStatus.OK);

      const categoryAfterDelete = await repo().findOne({
        where: { id: categoryId },
      });

      expect(categoryAfterDelete).toBeNull();
    });
  });

  describe('Обновление категории (PATCH /:categoryId)', () => {
    const requestBuilder = (id: string) =>
      httpTransport.patch('/api/categories/' + id);

    it('Передаем неправильный формат id => получаем 400', async () => {
      const resp = await requestBuilder('1234').expect(HttpStatus.BAD_REQUEST);
      expect(resp.body.message).toEqual('Validation failed (uuid is expected)');
    });

    it('Передаем пустое body => получаем 400', async () => {
      const resp = await requestBuilder(
        '41d36d01-3d06-48ec-90ea-735d95d8a1f2',
      ).expect(HttpStatus.BAD_REQUEST);
      expect(resp.body.message).toEqual(
        'Необходимо передать в body хотя бы один параметр',
      );
    });

    it('Передаем уже существующий параметр slug => получаем 400', async () => {
      const slug = 'second';

      const resp = await requestBuilder('41d36d01-3d06-48ec-90ea-735d95d8a1f2')
        .send({ slug })
        .expect(HttpStatus.BAD_REQUEST);

      expect(resp.body.message[0]).toEqual(
        `Категория с параметром slug "${slug}" уже существует.`,
      );
    });

    it('Пытаемся проапдейтить несуществующую категорию => получаем 404', async () => {
      return requestBuilder('4d20160a-ade4-4a75-b5f9-054342028074')
        .send({ name: 'new_name' })
        .expect(HttpStatus.NOT_FOUND);
    });

    describe('Апдейтим поля', () => {
      beforeEach(runSeed);

      it('id проапдейтить не получится => в ответ 400', async () => {
        const resp = await requestBuilder(
          '41d36d01-3d06-48ec-90ea-735d95d8a1f2',
        )
          .send({ id: '7bfc6d58-5b35-4bb3-8d71-6bdf5cf1a8e8' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(resp.body.message[0]).toEqual('property id should not exist');
      });

      const singleFieldTest = (field: string, value: unknown) => async () => {
        const id = '41d36d01-3d06-48ec-90ea-735d95d8a1f2';

        const oldEntity = await repo().findOne({ where: { id } });

        await requestBuilder(id)
          .send({ [field]: value })
          .expect(HttpStatus.OK);

        const newEntity = await repo().findOne({ where: { id } });

        expect(oldEntity[field]).not.toEqual(newEntity[field]);
        expect(newEntity[field]).toEqual(value);
      };

      it('Апдейт поля slug', singleFieldTest('slug', 'qwerty'));

      it('Апдейт поля name', singleFieldTest('name', 'qwerty'));

      it('Апдейт поля description', singleFieldTest('description', 'qwerty'));

      it('Апдейт поля active', singleFieldTest('active', false));

      it('Апдейт поля createdDate', singleFieldTest('createdDate', new Date()));

      it('Апдейт поля slug кириллицей => получаем 400', async () => {
        const resp = await requestBuilder(
          '41d36d01-3d06-48ec-90ea-735d95d8a1f2',
        )
          .send({ slug: 'привет' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(resp.body.message[0]).toEqual(SLUG_MESSAGE);
      });
    });
  });

  describe('Список категорий GET /', () => {
    beforeAll(runSeed);

    const requestBuilder = () => httpTransport.get('/api/categories/');

    const DEFAULT_RESP =
      'первые две категории, отсортированные по дате создания по убыванию';

    it(`Вызываем запрос без параметров => получаем ${DEFAULT_RESP}`, async () => {
      const resp = await requestBuilder().expect(HttpStatus.OK);

      expect(resp.body.length).toEqual(2);

      const dbCategories = await repo().find({
        take: 2,
        order: { createdDate: 'DESC' },
      });

      [0, 1].forEach((index) => {
        expect(resp.body[index].id).toEqual(dbCategories[index].id);
      });
    });

    const defaultTest = (params) => async () => {
      const resp = await requestBuilder().query(params).expect(HttpStatus.OK);

      expect(resp.body.length).toEqual(2);

      const dbCategories = await repo().find({
        take: 2,
        order: { createdDate: 'DESC' },
      });

      [0, 1].forEach((index) => {
        expect(resp.body[index].id).toEqual(dbCategories[index].id);
      });
    };

    it(
      `Посылаем пробелы во все текстовые поля => получаем ${DEFAULT_RESP}`,
      defaultTest({
        name: '   ',
        description: '   ',
        search: '    ',
        sort: '  ',
      }),
    );

    it(
      `Посылаем пустые строки во все текстовые поля => получаем ${DEFAULT_RESP}`,
      defaultTest({
        name: '',
        description: '',
        search: '',
        sort: '',
      }),
    );

    describe('Проверка поля name', () => {
      it('Проверка на буквы "е" "ё" и учета регистра => выдает результаты без учета регистра, они содержат е ё и отсортированы по дате создания по убыванию', async () => {
        const resp = await requestBuilder()
          .query({ name: 'мед' })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(2);
        expect(resp.body[0].id).toEqual('5bbfbdec-f2a9-4d36-8cad-3579c1d8de3b'); //мёд
        expect(resp.body[1].id).toEqual('41d36d01-3d06-48ec-90ea-735d95d8a1f2'); //Мед
      });
    });

    describe('Проверка поля description', () => {
      it('Проверка на буквы "е" "ё" и учета регистра => выдает результаты без учета регистра, они содержат е ё и отсортированы по дате создания по убыванию', async () => {
        const resp = await requestBuilder()
          .query({ description: 'мед' })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(2);
        expect(resp.body[0].id).toEqual('86713e06-5de0-4ac3-ba09-9ad13592cc17'); //Мед
        expect(resp.body[1].id).toEqual('41d36d01-3d06-48ec-90ea-735d95d8a1f2'); //мЁд
      });
    });

    describe('Проверка поля search', () => {
      it('Проверка на буквы "е" "ё", учета регистра и логики поиска => выдает результаты по полям name и description, без учета регистра. Они содержат е ё и отсортированы по дате создания по убыванию ', async () => {
        const resp = await requestBuilder()
          .query({
            search: 'мед',
            pageSize: '4',
          })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(3);
        expect(resp.body[0].id).toEqual('5bbfbdec-f2a9-4d36-8cad-3579c1d8de3b'); //name мёд
        expect(resp.body[1].id).toEqual('86713e06-5de0-4ac3-ba09-9ad13592cc17'); //description Мед
        expect(resp.body[2].id).toEqual('41d36d01-3d06-48ec-90ea-735d95d8a1f2'); //description мЁд name Мед
      });
    });

    describe('Проверка поля sort', () => {
      it(
        `Пробуем передать поле, которое не является полем модели => получаем ${DEFAULT_RESP}`,
        defaultTest({ sort: 'azaza' }),
      );

      it('Тест направления ASC => получаем значения в порядке возрастания', async () => {
        const sortField = 'active';

        const resp = await requestBuilder()
          .query({ sort: sortField })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(2);

        const dbCategories = await repo().find({
          take: 2,
          order: { [sortField]: 'ASC' },
        });

        [0, 1].forEach((index) => {
          expect(resp.body[index].id).toEqual(dbCategories[index].id);
        });
      });

      it('Тест направления DESC => получаем значения в порядке убывания', async () => {
        const sortField = 'active';

        const resp = await requestBuilder()
          .query({ sort: `-${sortField}` })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(2);

        const dbCategories = await repo().find({
          take: 2,
          order: { [sortField]: 'DESC' },
        });

        [0, 1].forEach((index) => {
          expect(resp.body[index].id).toEqual(dbCategories[index].id);
        });
      });
    });

    describe('Проверка поля active', () => {
      it('Пробуем передать невалидное значение => получаем 400', async () => {
        await requestBuilder()
          .query({ active: 1234 })
          .expect(HttpStatus.BAD_REQUEST);
        await requestBuilder()
          .query({ active: '1234' })
          .expect(HttpStatus.BAD_REQUEST);
        await requestBuilder()
          .query({ active: 'gfgfghdj' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('Проверка истинных значений 1,true  => получаем значения, в которых active=true', async () => {
        const resp1 = await requestBuilder()
          .query({ active: '1' })
          .expect(HttpStatus.OK);

        expect(resp1.body.length).toEqual(2);

        const resp2 = await requestBuilder()
          .query({ active: 'true' })
          .expect(HttpStatus.OK);

        expect(resp2.body.length).toEqual(2);

        const dbCategories = await repo().find({
          take: 2,
          where: { active: true },
          order: { createdDate: 'DESC' },
        });

        [0, 1].forEach((index) => {
          expect(resp1.body[index].id).toEqual(dbCategories[index].id);
          expect(resp2.body[index].id).toEqual(dbCategories[index].id);
        });
      });

      it('Проверка ложных значений 0,false => получаем значения, в которых active=false', async () => {
        const resp1 = await requestBuilder()
          .query({ active: '0' })
          .expect(HttpStatus.OK);

        expect(resp1.body.length).toEqual(2);

        const resp2 = await requestBuilder()
          .query({ active: 'false' })
          .expect(HttpStatus.OK);

        expect(resp2.body.length).toEqual(2);

        const dbCategories = await repo().find({
          take: 2,
          where: { active: false },
          order: { createdDate: 'DESC' },
        });

        [0, 1].forEach((index) => {
          expect(resp1.body[index].id).toEqual(dbCategories[index].id);
          expect(resp2.body[index].id).toEqual(dbCategories[index].id);
        });
      });
    });

    describe('Проверка поля page', () => {
      it('Пробуем передать невалидное значение => получаем 400', async () => {
        await requestBuilder()
          .query({ page: 'azzaza' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('0 и 1 являются первой страницей => результаты двух вызовов с параметром page 0 и 1 - идентичны', async () => {
        const resp1 = await requestBuilder()
          .query({ page: 0 })
          .expect(HttpStatus.OK);

        const resp2 = await requestBuilder()
          .query({ page: 1 })
          .expect(HttpStatus.OK);

        resp1.body.forEach((cat, index) => {
          expect(cat).toEqual(resp2.body[index]);
        });
      });

      it('Проверка page = 2 => получаем последние 2 записи, отсортированные по createdDate в порядке убывания', async () => {
        const defaultPageSize = 2;
        const page = 2;

        const resp = await requestBuilder()
          .query({ page })
          .expect(HttpStatus.OK);

        expect(resp.body.length).toEqual(2);

        const dbCategories = await repo().find({
          take: defaultPageSize,
          skip: (page - 1) * defaultPageSize,
          order: { createdDate: 'DESC' },
        });

        [0, 1].forEach((index) => {
          expect(resp.body[index].id).toEqual(dbCategories[index].id);
        });
      });
    });

    describe('Проверка поля pageSize', () => {
      it('Пробуем передать невалидное значение => получаем 400', async () => {
        await requestBuilder()
          .query({ pageSize: 'azzaza' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('Минимальное значение 1, максимальное - 9 => если передаем больше или меньше, то получаем 400', async () => {
        await requestBuilder()
          .query({ pageSize: 0 })
          .expect(HttpStatus.BAD_REQUEST);
        await requestBuilder()
          .query({ pageSize: 10 })
          .expect(HttpStatus.BAD_REQUEST);
        await requestBuilder().query({ pageSize: 1 }).expect(HttpStatus.OK);
        await requestBuilder().query({ pageSize: 9 }).expect(HttpStatus.OK);
      });

      it('Проверка работы поля => получаем столько записей, сколько указали в параметре', async () => {
        const resp1 = await requestBuilder()
          .query({ pageSize: 1 })
          .expect(HttpStatus.OK);

        expect(resp1.body.length).toEqual(1);

        const resp2 = await requestBuilder()
          .query({ pageSize: 3 })
          .expect(HttpStatus.OK);

        expect(resp2.body.length).toEqual(3);

        const resp3 = await requestBuilder()
          .query({ pageSize: 9 })
          .expect(HttpStatus.OK);

        const categoriesCount = await repo().count();

        expect(resp3.body.length).toEqual(categoriesCount);
      });
    });
  });
});
