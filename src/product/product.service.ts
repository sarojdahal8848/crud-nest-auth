import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      const data = await this.productRepository.save(product);
      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      const data = await this.productRepository.find();
      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException('Product with this id does not exist.');
      }
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException('Product with this id does not exist.');
      }
      await this.productRepository.update(id, updateProductDto);
      const newProduct = await this.productRepository.findOne({
        where: { id },
      });
      return {
        success: true,
        data: newProduct,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException('Product with this id does not exist.');
      }
      await this.productRepository.delete(id);
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
