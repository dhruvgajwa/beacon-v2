"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const newrelic_service_1 = require("./monitoring/newrelic.service");
const logging_interceptor_1 = require("./monitoring/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const nr = app.get(newrelic_service_1.NewRelicService);
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(nr));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Beacon API")
        .setDescription("The Beacon API description")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map