import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthStrategy } from '../dto/user.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, AuthStrategy.GOOGLE) {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: ['email', 'profile'],
      prompt: 'select_account consent',
      accessType: 'offline',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const obj = profile._json
    const { name, picture, email } = obj
    const foundUser = await this.authService.getUser({email: email})
    if (!foundUser) {
      const password = await this.authService.generate(10)
      const newUser = await this.authService.createUser(email, password, { avatar: picture, userName: name })
      return newUser
    }
    return foundUser
  }
}
