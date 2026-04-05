import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthStrategy } from "../dto/user.dto";

@Injectable()
export class JwtRefreshGuard extends AuthGuard(AuthStrategy.REFRESH_JWT) {}