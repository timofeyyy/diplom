import { BadRequestException, CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { TokenType } from '../dto/user.dto';
import * as cookie from 'cookie';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

export function DeleteTokenGuard(types: TokenType[]): Type<CanActivate> {
    @Injectable()
    class DeleteTokenMixin implements CanActivate {
        constructor(
            private readonly authService: AuthService
        ) { }
        async canActivate(context: ExecutionContext): Promise<any> {
            const request = context.switchToHttp().getRequest();
            const response = context.switchToHttp().getResponse();
            const user = request.user;
            const id = (user._id as Types.ObjectId).toString()
            if (id) {
                const cookies = request.headers.cookie
                if (cookies) {
                    const parsed = cookie.parse(cookies)
                    for (const type of types) {
                        const value = parsed[type]
                        if (value) {
                            // // console.log(`delete ${type} ${value}`)

                            const result = await this.authService.removeToken(id, type, value)
                            if (result) {
                                response.clearCookie(type)
                            }
                        }
                    }
                }
                return user
            }

            throw new BadRequestException()

        }
    }

    return mixin(DeleteTokenMixin);
}