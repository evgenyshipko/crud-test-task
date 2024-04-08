import { CategoryEntity } from '../../entities/category.entity';

export const categories: CategoryEntity[] = [
  {
    id: '41d36d01-3d06-48ec-90ea-735d95d8a1f2',
    slug: 'first',
    description: 'мЁд',
    active: true,
    createdDate: new Date('2024-03-06T13:58:26.778Z'),
    name: 'Мед',
  },
  {
    id: '5bbfbdec-f2a9-4d36-8cad-3579c1d8de3b',
    slug: 'second',
    active: true,
    createdDate: new Date('2024-04-06T13:58:26.778Z'),
    name: 'мёд',
  },
  {
    id: '86713e06-5de0-4ac3-ba09-9ad13592cc17',
    slug: 'third',
    description: 'Мед',
    active: false,
    createdDate: new Date('2024-04-02T13:58:26.778Z'),
    name: 'прогоол!',
  },
  {
    id: '179d9fb4-1b89-49c8-918e-e99d67285144',
    slug: 'fourth',
    description: 'парам пам пам',
    active: false,
    createdDate: new Date('2024-12-06T13:58:26.778Z'),
    name: 'афобазол',
  },
];
