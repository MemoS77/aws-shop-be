import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CartService {
  private apiUrl = null;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('CART_SERVICE');
  }

  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  findAll() {
    if (!this.apiUrl)
      throw new InternalServerErrorException('Cart Service API URL not set');

    return `This action returns all carts. Target AWS Service: ${this.apiUrl}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
