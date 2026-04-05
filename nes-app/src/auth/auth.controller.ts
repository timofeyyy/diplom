import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, UnauthorizedException, BadRequestException, ConflictException, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google.guard';
import jwt from 'jsonwebtoken';
import { TokenResponse } from 'src/redis/dto/token.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAccessGuard } from './guards/jwt.acces.guard';
import { JwtRefreshGuard } from './guards/jwt.refresh.guard';
import { TokenType } from './dto/user.dto';
import * as cookie from 'cookie';
import { DeleteTokenGuard } from './guards/delete.token.guard';
import { CreateTokenGuard } from './guards/create.token.guard';
import { UserCookiesGuard } from './guards/user.cookies.guard';
import { EncryptionService } from './encryption.service';
import { EmailVerifierGuard } from './guards/email.verifier.guard';
import { MailService } from '../mailer/mailer.service'
import { User } from 'src/mongodb/user/user.schema';
import { ok } from 'node:assert';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly mailService: MailService

  ) { }

  @UseGuards()
  @Post('signUp')
  async signUp(
    @Body() body
  ) {
    const email = body.username
    const password = body.password
    if (email && password) {
      const foundUser = await this.auth.getUser({ email: email })
      if (foundUser) {
        throw new ConflictException('User with this email already exists.');
      }
      else {
        const res = await this.auth.createUser(email, password, {} as any) != null
        if (res) {
          return { statusCode: 200, transcript: 'OK', message: 'Account successesfully created!' }
        }
      }
    }
    throw new BadRequestException('Invalid input data provided.');
  }
  logger = new Logger()
  @Post('new-password')
  @UseGuards(EmailVerifierGuard)
  async chnageCred(
    @Body() body,
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    const newPassword = body.newPassword
    // console.log(body, newPassword)
    if (newPassword) {
      const token = await this.auth.generateToken({
        _id: req.user._id,
        data: {
          newPassword: newPassword,
          email: req.user.email,
          birthday: new Date().toISOString()
        }
      }, TokenType.PASSWORD_TOKEN)
      this.logger.debug({controller: AuthController.name, str: process.env.PASSWORD_RESET_URL_FRONT})
      const link = `${process.env.PASSWORD_RESET_URL_FRONT}${token}`
      await this.mailService.sendTest(link, req.user.email)
      return { statusCode: 200, transcript: 'ok', message: 'Check your email, we have sent you a link to submit changes.' }
    }
    throw new BadRequestException()
  }
  @Post('update-password')
  async updatePassword(@Req() req, @Body() body) {
    const passid = body.passid
    if (passid) {
      const tokenRecord = await this.auth.verifyToken(TokenType.PASSWORD_TOKEN, passid)
      if (tokenRecord && tokenRecord.data.email) {
        const user = await this.auth.getUser({ email: tokenRecord.data.email })
        if (user) {
          let res =await this.auth.updatePassword(user, passid)
          await this.auth.removeToken(user._id.toString(), TokenType.PASSWORD_TOKEN, passid)
          return { statusCode: 200, transcript: 'ok', message: 'Passport was updated.' }

        }
      }
      else {
        throw new UnauthorizedException()
      }
    }
    else {
      throw new BadRequestException()
    }
  }


  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(
    GoogleAuthGuard,
    DeleteTokenGuard([TokenType.REFRESH_TOKEN, TokenType.ACCES_TOKEN]),
    CreateTokenGuard([TokenType.REFRESH_TOKEN, TokenType.ACCES_TOKEN])
  )
  async googleAuthRedirect(
    @Res({ passthrough: true }) res
  ) {
    res.send(`
    <html>
      <body>
        <script>
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
          window.close();
        </script>
      </body>
    </html>
  `);
  }

  @Post('login')
  @UseGuards(
    LocalAuthGuard,
    DeleteTokenGuard([TokenType.REFRESH_TOKEN, TokenType.ACCES_TOKEN]),
    CreateTokenGuard([TokenType.REFRESH_TOKEN, TokenType.ACCES_TOKEN])
  )
  async login() { }

  @UseGuards(
    JwtRefreshGuard,
    UserCookiesGuard,
    DeleteTokenGuard([TokenType.REFRESH_TOKEN, TokenType.ACCES_TOKEN]),
  )
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    // await this.auth.logout(req.user, req.headers.cookie)
    // res.clearCookie(TokenType.ACCES_TOKEN)
    // res.clearCookie(TokenType.REFRESH_TOKEN)
  }



  @UseGuards(
    JwtRefreshGuard,
    UserCookiesGuard,
    DeleteTokenGuard([TokenType.ACCES_TOKEN]),
    CreateTokenGuard([TokenType.ACCES_TOKEN])
  )
  @Post('refresh')
  async refresh() { }

  @Post('user-exists')
  async userExists(
    @Body() body,
  ) {
    const email = body.email
    if (email) {
      const foundUser = await this.auth.getUser({ email: email })
      if (foundUser) {
        return { statusCode: 302, transcript: 'Found', message: 'User founded' }
      }
      else {
        throw new NotFoundException("User not founded")
      }
    }
    else {
      throw new BadRequestException()
    }
  }
}
