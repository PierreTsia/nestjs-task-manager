import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto, UsernameDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialDto);
  }

  @Post('/signin')
  async signin(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signIn(authCredentialDto);
  }

  @Get('/username/check')
  checkUsername(
    @Body(ValidationPipe) usernameDto: UsernameDto,
  ): Promise<boolean> {
    return this.authService.isUsernameValid(usernameDto);
  }
}
