import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    const allowedRoutes = ['/product', '/cart'];
    const isAllowed = allowedRoutes.some((route) => req.path.startsWith(route));

    if (!isAllowed) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Cannot process request',
      });
    }
    next();
  });

  await app.listen(3000);
}
bootstrap();
