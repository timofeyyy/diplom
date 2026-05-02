import { CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

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
            if (result) {
                const { password, ...data } = foundUser
                request.user = data
                return data
            }
        }
   
        throw new UnauthorizedException("No session");
    }
}