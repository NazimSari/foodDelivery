import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/Prisma.Service';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  //register user
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const user = {
      name,
      email,
      password,
    };
    return user;
  }

  //login server
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = {
      email,
      password,
    };
    return user;
  }

  //get all users
  async getUsers() {
    return this.prisma.user.findMany({});
  }
}
