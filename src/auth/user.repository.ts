import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Logger } from '@nestjs/common';
import { ErrorCode } from './types/error-code.enum';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('UserRepository');
  async signUp(signUpDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = signUpDto;
    const salt = await bcrypt.genSalt();
    const user = this.create();
    user.username = username;
    user.password = await this.hashPassword(password, salt);
    user.salt = salt;
    try {
      await user.save();
      this.logger.verbose(`Success signing up ${JSON.stringify(user)}`);

    } catch (e) {
      if (e.code === ErrorCode.DUPLICATE_KEY) {
        throw new ConflictException(`username "${username}" already exists`);
      }
      this.logger.error(`Error signing up ${JSON.stringify(e)}`);
      throw new InternalServerErrorException();
    }
  }

  private hashPassword = async (
    password: string,
    salt: string,
  ): Promise<string> => await bcrypt.hash(password, salt);

  validateUserPassword = async (authCredentialsDto: AuthCredentialsDto) => {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return false;
    }
  };
}
