import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppAlias, TokenStatus } from 'src/enum';
import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken';
import { catchError, concatMap, Observable, of } from 'rxjs';
import { TokenResponse } from 'src/redis/dto/token.response.dto';
import * as cookie from 'cookie';

@Injectable()
export class SocketService implements OnModuleInit {
    constructor(
        // private readonly auth: RedisAuthService
    ) { }


    logger = new Logger(SocketService.name)

    userData = {}
    onModuleInit() {
        this.userData[AppAlias.JAIL] = {}
    }
    joinRoom(client: Socket, roomId: string, userId: string, userName: string) {
        // console.log("sdsd")
        // this.logger.debug(roomId, userId, userName)
        // // console.log(data)
        // const roomId = data.roomId;
        // const userId = data.userId;
        // const userName = data.userName;
        if (!this.userData[roomId]) {
            this.userData[roomId] = {}
        }
        this.userData[roomId][userId] = userName;
        (client as any).roomId = roomId;
        (client as any).userName = userName;
        (client as any).userId = userId;
        // console.log(`${userName} joined room ${roomId} ${userId}`);
        // // console.log(userData)

        client.join(roomId);
        // socket.to(roomId).emit("user-connected", userId, userName);
        client.to(roomId).emit(
            'user-connected',
            userId,
            userName,
        );
    }


    // verifyAuthorization(client: any) {
    //     return of(null).pipe(
    //         concatMap(() => {
    //             const cookies = client.handshake.headers.cookie;
    //             if (!cookies) {
    //                 throw new Error('No cookies');
    //             }
    //             return of(cookies)
    //         }),
    //         concatMap((cookies: any) => {
    //             const parsed = cookie.parse(cookies);
    //             const token = parsed.jwt;
    //             if (!token) {
    //                 throw new Error('No token');
    //             }
    //             return of(token)
    //         }),
    //         concatMap((token: any) => {
    //             const payload = jwt.verify(token, process.env.JWT_SECRET!);
    //             client.data.user = payload;
    //             if (!payload) {
    //                 throw new Error('No payload');
    //             }
    //             return of(token)
    //         }),
    //         concatMap((token: any) => {
    //             // return this.auth.VerifyTokenRx(token);
    //             return of(token)
    //         }),
    //         concatMap((response: TokenResponse) => {
    //             if (response.error) {
    //                 throw new Error('No data from redis');
    //             }
    //             else {
    //                 return of(response.result?.status == TokenStatus.EXISTS)
    //             }
    //         }),
    //         concatMap((answer: boolean) => {
    //             if (answer) {
    //                 return of(null)
    //             }
    //             else {
    //                 throw new Error("Unauthorized")
    //             }
    //         }),
    //         catchError((err: any) => {
    //             // console.log("jwt verification failed")
    //             return of(err)
    //         })
    //     )
    // }



    // async verifyAuthorization(client: any, next: (...args: any) => void) {
    //     // console.log("verifyAuthorization")
    //     try {
    //         const cookies = client.handshake.headers.cookie;
    //         // // console.log(cookies)
    //         if (!cookies) {
    //             return next(new Error('No cookies'));
    //         }

    //         const parsed = client.parse(cookies);
    //         const token = parsed.jwt;

    //         if (!token) {
    //             return next(new Error('No token'));
    //         }
    //         // // console.log(token)
    //         try {
    //             // console.log(process.env.JWT_SECRET)
    //             const payload = jwt.verify(token, process.env.JWT_SECRET!);
    //             client.data.user = payload;
    //             let isAuthenticated: boolean = false;
    //             // console.log(payload)
    //             if (payload) {
    //                 // console.log(isAuthenticated)
    //                 isAuthenticated = await this.auth.VerifyToken(token);
    //             }
    //             if (!isAuthenticated) {
    //                 next(new Error('Unauthorized'));
    //             }
    //             else {
    //                 next()
    //             }
    //         } catch (error) {
    //             // console.log(error)
    //             // console.log("jwt verification failed")
    //             next(new Error('Unauthorized'));
    //         }

    //     }
    //     catch (err: any) {
    //         // console.log("error")
    //         next(new Error(err.message));
    //     }
    // }

    getUserData(roomId: string, userId: string) {
        return this.userData[roomId][userId];
    }

    userDisonnected(client: any, roomId: string, userId: string) {
        client.to(roomId).emit('user-disconnected', userId);
    }

    handleDisconnect(server: any, client: any) {
        const roomId = (client as any).roomId
        const userId = (client as any).userId
        if (this.userData[roomId] && this.userData[roomId][userId])
            delete this.userData[roomId][userId];
        // console.log('user-disconnected', userId)
        if (roomId && userId) {
            server.to(roomId).emit('user-disconnected', userId);
        }
        // console.log(this.userData)
    }
}
