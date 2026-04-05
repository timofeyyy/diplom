import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '/conference',
  cors: {
    origin: '*',
  },
})
export class SocketConferenceGateway implements OnGatewayConnection   {
  constructor(
    private readonly socketService: SocketService,
  ) { }
  handleConnection(client: any, ...args: any[]) {
    console.log("\n\n\n\n\n\n\n\n\n\n")
  }

  private logger = new Logger(SocketConferenceGateway.name)

  @WebSocketServer()
  server: Server;



  @SubscribeMessage('join-video-room')
  joinRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const [roomId, userId, userName] = data
    this.socketService.joinRoom(client, roomId, userId, userName)
  }

  @SubscribeMessage('get-user-data')
  getUserData(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data)
    console.log('get-user-data')
    const [roomId, userId] = data
    return this.socketService.getUserData(roomId, userId)
  }

  @SubscribeMessage('user-disconnected')
  userDisonnected(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const [roomId, userId] = data
    this.socketService.userDisonnected(client, roomId, userId)
  }
}
