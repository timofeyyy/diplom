import { BadRequestException, CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { TokenType } from '../dto/user.dto';
import * as cookie from 'cookie';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

export function CreateTokenGuard(types: TokenType[]): Type<CanActivate> {
    @Injectable()
    class CreateTokenMixin implements CanActivate {
        constructor(
            private readonly authService: AuthService
        ) { }
        async canActivate(context: ExecutionContext): Promise<any> {
            const request = context.switchToHttp().getRequest();
            const response = context.switchToHttp().getResponse();
            const user = request.user;
            const id = (user._id as Types.ObjectId).toString()
            if (id) {
                // console.log("create token")
                for (const type of types) {
                    const value = await this.authService.generateToken({
                        _id: id, data: {
                            birthday: new Date().toISOString()
                        }
                    }, type)
                    // console.log(`create ${type} ${value}`)
                    if (value) {
                        response.cookie(type, value, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'strict',
                        });
                    }
                }
                return user
            }
            throw new BadRequestException()
        }
    }

    return mixin(CreateTokenMixin);
}