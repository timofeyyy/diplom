import { CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { TokenType } from '../dto/user.dto';
import * as cookie from 'cookie';
import { AuthService } from '../auth.service';
// import { UsersService } from 'src/users/user.service';
import { User } from 'src/mongodb/user/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class UserCookiesGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const foundUser = await this.authService.getUser({_id: user._id})
        const cookies = request.headers.cookie
        if (foundUser && cookies) {
            let result = await this.authService.validateUserByCookies(user, cookies)
            // console.log(`result = ${result}`)
            if (result) {
                const { password, ...data } = foundUser
                request.user = data
                return data
            }
        }
   
        throw new UnauthorizedException("No session");
    }
}