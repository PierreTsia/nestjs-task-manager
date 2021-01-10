import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { RULES } from '../utils/rules.util';

export class UsernameDto {
  @IsString()
  @MinLength(RULES.USER_NAME.MIN_LENGTH)
  @MaxLength(RULES.USER_NAME.MAX_LENGTH)
  username: string;
}

export class AuthCredentialsDto extends UsernameDto {
  @IsString()
  @MinLength(RULES.PASSWORD.MIN_LENGTH)
  @MaxLength(RULES.PASSWORD.MAX_LENGTH)
  @Matches(RULES.PASSWORD.FORMAT, { message: RULES.PASSWORD.MESSAGE })
  password: string;
}
