import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword, hashPassword } from 'src/utils/password-handler';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    try {
      const email = createAuthDto.email;
      const user = await this.authRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('Email or password does not match');
      }
      const hashPassword = await comparePassword(
        createAuthDto.password,
        user.password,
      );
      if (!hashPassword) {
        throw new BadRequestException('Email or password does not match');
      }

      delete user.password;
      const token = this.jwtService.sign({
        email: user.email,
        sub: user.email,
      });
      return {
        success: true,
        data: {
          access_token: token,
        },
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async register(createAuthDto: CreateAuthDto) {
    try {
      const email = createAuthDto.email;

      const password = await hashPassword(createAuthDto.password);

      const checkUser = await this.authRepository.findOne({ where: { email } });

      if (checkUser) {
        throw new ConflictException('User with this email already exits');
      }

      const user = this.authRepository.create({
        email,
        password,
      });

      const savedUser = await this.authRepository.save(user);

      delete savedUser.password;

      const token = this.jwtService.sign({
        email: savedUser.email,
        sub: savedUser.email,
      });

      return {
        success: true,
        data: {
          access_token: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
