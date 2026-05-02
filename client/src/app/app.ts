import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpResponse } from '../dto/warning.dto';
import { CommunicationService } from '../service/communication/communication.service';
import { AppEnum, EventsEnum } from '../etc/enum/app.enum';
import { LoaderComponent } from "./components/loader/loader.component";
import { AuthHttpService } from '../service/http/auth.http.service';
import { RefreshHttpService } from '../service/http/refresh.service';
import { UsersHttpService } from '../service/http/users.http.service';
import { AuthActions } from '../etc/enum/settings.enum';
import { ImageViewer } from './components/image-viewer/image-viewer';
import { SocketUserService } from '../service/socket/socket.user.service';
import { OnSocketMessangerEnum, OnSocketNotificationEnum } from '../etc/enum/socket.enum';
import { UserDto } from '../dto/user.dto';
import { ChatsHistoryService } from '../service/user/chats.service';
import { MeService } from '../service/user/me.service';
import { ConfirmationEnum } from '../etc/enum/confirmation';
import { ConfirmWindow } from "./components/confirm-window/confirm-window";
import { ThemeService } from '../themes/theme.service';
import { SocketNotificationService } from '../service/socket/socket.notification.service';
import { NotificationService } from '../service/user/notification.service';
import { NotificationDto } from '../dto/notification.dto';
import { FreindsService } from '../service/user/friends.service';
import { EventDto } from '../dto/event.dto';
import { SuccesEvent } from './components/events/result-event/succes-event/succes-event';
import { ErrorEvent } from './components/events/result-event/error-event/error-event';
import { EventList } from "./components/events/event-list/event-list";
import { NotificationCounterService } from './components/notification/service/notification-counter.service';


@Component({
  selector: 'app-root',
  imports: [LoaderComponent, RouterOutlet, ImageViewer, ConfirmWindow, EventList],
  providers: [RefreshHttpService, AuthHttpService, UsersHttpService],
  templateUrl: './app.html',
  styleUrls: ['./app.css', '../styles/styles.css']
})
export class App implements OnInit {
  closeImage() {
    this.images = undefined
  }
  constructor(
    private readonly comm: CommunicationService,
    private readonly socketUser: SocketUserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly meSerivce: MeService,
    private readonly chatsService: ChatsHistoryService,
    private readonly themeService: ThemeService,
    private readonly socketNotficationService: SocketNotificationService,
    private readonly notficationService: NotificationService,
    private readonly notificationCounterService: NotificationCounterService,
    private readonly friendsService: FreindsService
  ) { }

  loader!: boolean
  connected: boolean = false
  confirmAction!: string
  confirmMessage!: string
  avatarImage: any

  ngOnInit(): void {
    this.themeService.init()
    this.comm.listen(AppEnum.LOADER).subscribe((res) => {
      this.loader = Boolean(res.active)
      this.cdr.detectChanges()
    })
    this.comm.listen(AuthActions.LOG_OUT).subscribe((_) => {
      this.socketUser.disconnect()
      this.socketNotficationService.disconnect()
      this.router.navigate(['/user-auth'])
    })
    this.comm.listen(EventsEnum.LOGGED_IN).subscribe((_) => {
      this.router.navigate(['/home'])
    })
    this.comm.listen(AppEnum.OPEN_IMAGE).subscribe((res) => {
      this.images = res
    })
    this.comm.listen(OnSocketMessangerEnum.PROFILE_UPDATE).subscribe((res) => {
      const sender: UserDto = res
      this.meSerivce.setSource(sender)
    })
    this.comm.listen(OnSocketMessangerEnum.CHAT_HISTORY_UPDATE).subscribe(async (res) => {
      this.chatsService.update()
    })
    this.comm.listen(ConfirmationEnum.OPEN).subscribe((res) => {
      this.confirmAction = res?.action
      this.confirmMessage = res?.confirmMessage
    })
    this.comm.listen(AppEnum.OPEN_AVATAR_UPPLOAD).subscribe((res) => {
      this.avatarImage = res.avatar
    })
    this.comm.listen(OnSocketNotificationEnum.NOTIFICATION_RECEIVE).subscribe((res: NotificationDto) => {
      this.notficationService.appendUnsafe(res)
      this.notificationCounterService.update()
    })
  }

  images?: {
    urls: string[],
    openIndex: number
  }
}
