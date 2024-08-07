import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  private apiUrl = null;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('PRODUCT_SERVICE');
  }

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    if (!this.apiUrl)
      throw new InternalServerErrorException('Product Service API URL not set');
    return `This action returns all product. Target AWS Service: ${this.apiUrl}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
