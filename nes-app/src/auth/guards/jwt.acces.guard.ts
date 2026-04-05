import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthStrategy } from "../dto/user.dto";

@Injectable()
export class JwtAccessGuard extends AuthGuard(AuthStrategy.ACCES_JWT) {}
