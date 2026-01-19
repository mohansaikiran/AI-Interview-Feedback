import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({ email, passwordHash });
    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    this.logger.log(`Login attempt for ${email}`);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.log(`Login failed - user not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      this.logger.log(`Login failed - invalid password for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log(`Login successful for ${email}`);

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    this.logger.log(`Signing JWT for userId=${userId}`);
    const accessToken = this.jwtService.sign({ sub: userId, email });
    return { accessToken };
  }
}