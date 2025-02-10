import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/Prisma.Service';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please login to access this resource');
    }
    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken);

      const expirationTime = decoded?.exp;

      if (expirationTime * 1000 < Date.now()) {
        await this.updatedAccessToken(req);
      }
      // Kullanıcıyı yeniden al ve req.user olarak set et
      const decodedAfterRefresh = this.jwtService.decode(accessToken) as any;

      if (decodedAfterRefresh?.id) {
        req.user = await this.prisma.user.findUnique({
          where: { id: decodedAfterRefresh.id },
        });
      }
    }

    return true;
  }
  private async updatedAccessToken(req: any): Promise<void> {
    try {
      const refreshTokenData = req.headers.refreshtoken as string;
      const decoded = this.jwtService.decode(refreshTokenData);

      const expirationTime = decoded.exp * 1000;

      if (expirationTime < Date.now()) {
        throw new UnauthorizedException('Please login to access this resource');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      const accessToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: this.config.get<string>('ACESS_TOKEN_SECRET'),
          expiresIn: '5m',
        },
      );

      const refreshToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      );

      req.accesstoken = accessToken;
      req.refreshtoken = refreshToken;
      req.user = user;
    } catch (error) {
      console.log('Error in updatedAccessToken:', error);
    }
  }
}
