
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '../dto/user.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategy.LOCAL) {}
