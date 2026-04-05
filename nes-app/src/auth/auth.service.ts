
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisTokenService } from 'src/redis/redis.token.service';
// import { UsersService } from 'src/users/user.service';
import { tokens_ttl_sec, TokenType } from './dto/user.dto';
import * as cookie from 'cookie';
import { MongoUserService } from 'src/mongodb/user/user.service';
import { User, UserDocument } from 'src/mongodb/user/user.schema';
import { EncryptionService } from './encryption.service';
import { Types } from 'mongoose';
import { MongoWrapper } from 'src/mongodb/mongo.types';

@Injectable()
export class AuthService {
  constructor(
    // private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisToken: RedisTokenService,
    private readonly mongoUserService: MongoUserService,
    private readonly encryptionService: EncryptionService
  ) { }


  generate(length: number) {
    const result = this.encryptionService.generate(length)
    console.log(result)
    return result
  }


  async createUser(email: string, password: string, defaults: {
    userName: string | void,
    avatar: string | void
  }) {
    const tmpBuff = email.split('@')
    let { userName, avatar } = defaults
    // if (!userName) {
    userName = tmpBuff.length > 1 ? tmpBuff[0] : `${email}`
    // }
    // if (!avatar) {
    const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');;
    avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${userName}&backgroundColor=${color}`;
    // }
    const encryptedPassword = await this.encryptionService.hash(password)
    const newUser: User = {
      email: email,
      password: encryptedPassword,
      avatar: avatar,
      userName: userName,
      status: {
        show: true,
        lastTime: new Date(),
        online: false
      }
    }
    return await this.mongoUserService.insertOne(newUser)
  }

  async validateUserByPassword(email: string, pass: string): Promise<any> {
    const user = await this.mongoUserService.findOne({ email: email });
    if (user) {
      const verified = await this.encryptionService.verify(user?.password, pass)
      if (verified) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
  // async findUser(email: string): Promise<User | null> {
  //   return await this.mongoUserService.findOne({email:email})
  // }

  async validateUserByCookies(user: any, cookies: string) {
    const parsed = cookie.parse(cookies);
    const refreshToken = await this.verifyToken(TokenType.REFRESH_TOKEN, parsed[TokenType.REFRESH_TOKEN])
    // console.log("validateUserByCookies")
    // console.log(user)
    // console.log(refreshToken)
    // console.log(refreshToken!._id)
    // console.log(user._id)
    return refreshToken && refreshToken._id == user._id
  }

  // async getUserId(email: string) {
  //   const user = await this.mongoUserService.findOne({ email: email })
  //   return user?._id as string | undefined
  // }

  async getUser(params: Partial<MongoWrapper<User>>) {
    return await this.mongoUserService.findOne(params)
  }

  async updatePassword(user: User, passid: string) {
    const tokenRecord = await this.verifyToken(TokenType.PASSWORD_TOKEN, passid)
    const newPassword = tokenRecord?.data.newPassword
    if (tokenRecord && newPassword) {
      user.password = await this.encryptionService.hash(newPassword)
      await this.mongoUserService.updateOne({ email: user.email }, user)
    }
    return tokenRecord && tokenRecord.data.newPassword
  }

  // async update(user: User) {
  //   const foundUser = await this.isUserExistsByEmail(user.email)
  //   if(foundUser) {

  //   }
  // }

  // async removeAccesToken(email: string, token: string) {
  //   await this.redisToken.delToken({
  //     tokenType: TokenType.ACCES_TOKEN,
  //     value: token
  //   },
  //     email
  //   )
  // }

  // async removeRefreshToken(email: string, token: string) {
  //   await this.redisToken.delToken({
  //     tokenType: TokenType.ACCES_TOKEN,
  //     value: token
  //   },
  //     email
  //   )
  // }

  // async generateAccessToken(email: string) {
  //   // console.log("generateAccessToken")
  //   // console.log(user)
  //   const token = this.jwtService.sign(
  //     { email: email },
  //     {
  //       secret: process.env.JWT_ACCESS_SECRET,
  //       expiresIn: `${tokens_ttl_sec.accesToken}s`,
  //     },
  //   )

  //   const res = await this.redisToken.setToken({
  //     tokenType: TokenType.ACCES_TOKEN,
  //     value: token
  //   },
  //     email
  //   )
  //   if (res) {
  //     return token
  //   }
  //   return null
  // }

  // async generateRefreshToken(email: string) {
  //   const token = this.jwtService.sign(
  //     { email: email },
  //     {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //       expiresIn: `${tokens_ttl_sec.refreshToken}s`,
  //     },
  //   )

  //   const res = await this.redisToken.setToken({
  //     tokenType: TokenType.REFRESH_TOKEN,
  //     value: token
  //   },
  //     email
  //   )

  //   if (res) {
  //     return token
  //   }
  //   return null
  // }
  async removeToken(id: string, type: TokenType, token: string) {
    return await this.redisToken.delToken({
      tokenType: type,
      value: token
    },
      id
    )
  }
  async verifyToken(tokenType: TokenType, value: string) {
    return await this.redisToken.getToken({
      tokenType: tokenType,
      value: value
    })
  }

  async generateToken(
    payload: {
      _id: string,
      data: any
    },
    type: TokenType) {
    const token = this.jwtService.sign(
      { _id: payload._id },
      {
        secret: type == TokenType.REFRESH_TOKEN ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET,
        expiresIn: `${tokens_ttl_sec[type]}s`,
      },
    )

    const res = await this.redisToken.setToken({
      tokenType: type,
      value: token
    },
      payload
    )

    if (res) {
      return token
    }
    return null
  }
}



//https://docs.nestjs.com/recipes/passport