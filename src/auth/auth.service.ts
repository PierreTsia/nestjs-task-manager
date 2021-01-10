import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto, UsernameDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: AuthCredentialsDto): Promise<void> {
    return await this.userRepository.signUp(signUpDto);
  }
  async isUsernameValid(usernameDto: UsernameDto): Promise<boolean> {
    const { username } = usernameDto;
    const found = await this.userRepository.findOne({ username: username });
    if (found) {
      throw new ConflictException(`username "${username}" already exists`);
    }
    return !found;
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    if (!username) {
      throw new UnauthorizedException(`Invalid credentials`);
    }
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }
}
