import { BadRequestException, CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { TokenType } from '../dto/user.dto';
import * as cookie from 'cookie';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from 'src/mailer/mailer.service';

@Injectable()
export class EmailVerifierGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();
        const email = request.body.email
        // console.log(email)
        if (email) {
            const foundUser = await this.authService.getUser({ email: email })
            if (foundUser) {
                // console.log("send " + email)
                request.user = {
                    _id: foundUser._id,
                    email: foundUser.email
                }
                // console.log(request.user)
                return request.user
            }
            else {
                throw new UnauthorizedException()
            }
        }
        throw new BadRequestException()
    }
}