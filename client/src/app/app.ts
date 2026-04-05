import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpErrorNotification } from "./components/notification/notification";
import { HttpResponse } from '../dto/warning.dto';
import { CommunicationService } from '../service/communication/communication.service';
import { AppEnum, EventsEnum } from '../etc/enum/app.enum';
import { LoaderComponent } from "./components/loader/loader.component";
import { AuthHttpService } from '../service/http/auth.http.service';
import { AuthHttpRequirementService } from '../service/http/auth.http.requirements.service';
import { UsersHttpService } from '../service/http/users.http.service';
import { AuthActions } from '../etc/enum/settings.enum';
import { AppConfigService } from '../service/config/app-config.service';
import { ImageViewer } from './components/image-viewer/image-viewer';
import { SocketUserService } from '../service/socket/socket.user.service';
import { OnSocketMessangerEnum, OnSocketNotificationEnum } from '../etc/enum/socket.enum';
import { UserDto } from '../dto/user.dto';
import { ChatsHistoryService } from '../service/user/chats.service';
import { MeService } from '../service/user/me.service';
import { NotificationService } from '../service/user/notification.service';


@Component({
  selector: 'app-root',
  imports: [HttpErrorNotification, LoaderComponent, RouterOutlet, ImageViewer],
  providers: [AuthHttpRequirementService, AuthHttpService, UsersHttpService],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  closeImage() {
    this.images = undefined
  }
  constructor(
    private readonly comm: CommunicationService,
    private readonly socketUser: SocketUserService,
    private readonly router: Router,
    private readonly appConfig: AppConfigService,
    private readonly cdr: ChangeDetectorRef,
    private readonly meSerivce: MeService,
    private readonly chatsService: ChatsHistoryService,
  ) { }
  notificationBody: HttpResponse | undefined
  loader!: boolean
  connected: boolean = false

  ngOnInit(): void {
    this.comm.listen(AppEnum.NOTIFICATION).subscribe((res) => {
      this.notificationBody = res.payload
      setTimeout(() => {
        this.notificationBody = undefined
      }, 3000);
    })
    this.comm.listen(AppEnum.LOADER).subscribe((res) => {
      this.loader = Boolean(res.action)
      this.cdr.detectChanges()
    })
    this.comm.listen(AuthActions.LOG_OUT).subscribe((res) => {
      console.log(res)
      this.socketUser.disconnect()
      this.router.navigate(['/user-auth'])
    })
    this.comm.listen(EventsEnum.LOGGED_IN).subscribe((res) => {
      this.router.navigate(['/home'])
    })
    this.comm.listen(AppEnum.OPEN_IMAGE).subscribe((res) => {
      this.images = res.payload
    })
    this.comm.listen(OnSocketMessangerEnum.PROFILE_UPDATE).subscribe((res) => {
      const sender: UserDto = res.payload
      this.meSerivce.setSource(sender)
    })
    this.comm.listen(OnSocketMessangerEnum.CHAT_HISTORY_UPDATE).subscribe((res) => {
      this.chatsService.update()
    })
  }
  closeAlert() {
    this.notificationBody = undefined
  }

  images?: {
    urls: string[],
    openIndex: number
  }
}
