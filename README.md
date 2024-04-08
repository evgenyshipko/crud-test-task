## CRUD TEST TASK

Немного о выполненном задании:
- Написано более 40 e2e-тестов на все перечисленные в задании ручки. Постарался проверить все корнеры.
- Санитайзинг осуществялется частично при помощи dto, которые не дают пропихнуть вредоносную строку в поля типа boolean, number. Для стринговых полей санитайзинг осуществляет уже TypeORM при передаче строки как параметра в функцию orm или квери-билдер.
- Немного пришлось подумать над условием, что метод update должен апдейтить **все поля модели**. Решил в итоге сделать, чтобы id нельзя было апдейтить т.к. это все-таки уникальный идентификатор и его изменение может привнести путаницу в работу системы.
- Валидация поля slug, в которое нельзя писать кириллицу, осуществляется с помощью regexp как на стороне базы, так и на стороне dto. Остальные текстовые поля (name, description) работают по-умолчанию т.е. в них можно писать и кириллицу и латиницу
- Условие фильтрации из задания "По вхождению переданного текста без учета регистра" интерпретировал как "по первому вхождению"

### Stack
Typescript, Nest.js, TypeORM, Postgres, jest, Docker

### Get started with Docker
1. Create .env file in project's root folder, fill that like .env.example
2. Build docker containers.
```bash
docker-compose build
```
3. Start docker containers
```bash
docker-compose up
```
4. Server starts on a port from PORT env variable

### Run e2e-tests
1. Start dockers containers in a way mentioned above
2. Go into crud_categories container shell
```bash
docker exec -it crud_categories bash
```
3. In the shell run test comand
```bash
npm run test:e2e
```