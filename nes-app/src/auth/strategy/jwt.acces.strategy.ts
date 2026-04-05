
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookie from 'cookie';
import { AuthStrategy, TokenType } from '../dto/user.dto';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
    Strategy,
    AuthStrategy.ACCES_JWT,
) {
    constructor(
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    const cookies = req.headers.cookie
                    let parsed = "";
                    if (cookies) {
                        parsed = cookie.parse(cookies)[TokenType.ACCES_TOKEN]
                    }
                    return parsed
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET!,
        });
    }

    async validate(payload: any) {
        return {
            _id: payload._id,
        };
    }
}
