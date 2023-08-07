import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function main() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const swagger = new DocumentBuilder()
    .setTitle(config.get('APIDOCS_TITLE'))
    .setDescription(config.get('APIDOCS_DESCRIPTION'))
    .setVersion(config.get('APIDOCS_VERSION'))
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.get('PORT'));
}
main();
