import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setAppConfig } from './appconfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setAppConfig(app);

  await app.listen(process.env.PORT);
}
bootstrap();
