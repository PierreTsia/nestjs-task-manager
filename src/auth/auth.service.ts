import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto, UsernameDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
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
}
