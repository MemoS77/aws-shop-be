import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [CartModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
