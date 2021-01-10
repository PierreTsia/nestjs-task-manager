import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ErrorCode } from './utils/error-code.enum';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(signUpDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = signUpDto;
    const salt = await bcrypt.genSalt();
    const user = new User();
    user.username = username;
    user.password = await this.hashPassword(password, salt);
    try {
      await user.save();
    } catch ({ code }) {
      if (code === ErrorCode.DUPLICATE_KEY) {
        throw new ConflictException(`username "${username}" already exists`);
      }
      throw new InternalServerErrorException();
    }
  }

  private hashPassword = async (
    password: string,
    salt: string,
  ): Promise<string> => await bcrypt.hash(password, salt);
}
