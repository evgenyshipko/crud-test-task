FROM node:16

COPY package*.json ./

RUN npm ci

COPY . /

RUN npm run build

CMD npm run migration:run && npm run seed && npm run start:prod