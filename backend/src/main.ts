import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { NewRelicService } from "./monitoring/newrelic.service"
import { LoggingInterceptor } from "./monitoring/logging.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors()

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  // Ensure NewRelicModule is available (already registered via AppModule imports if added)
  const nr = app.get(NewRelicService)
  app.useGlobalInterceptors(new LoggingInterceptor(nr))

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Beacon API")
    .setDescription("The Beacon API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  await app.listen(3000)
}
bootstrap()
