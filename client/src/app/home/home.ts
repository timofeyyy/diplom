import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navigator } from "../navigator/navigator";
import { DatePipe } from '@angular/common';
import { HorizontalHeader } from '../components/horizontal-header/horizontal-header';
import { AuthHttpService } from '../../service/http/auth.http.service';
import { Router } from '@angular/router';
import { AuthHttpRequirementService } from '../../service/http/auth.http.requirements.service';
import { CommunicationService, Dispatch } from '../../service/communication/communication.service';
import { PopupSettingsOptions } from "../components/popup-settings-options/popup-settings-options";
import { SettingsOptions } from '../../etc/enum/settings.enum';
import { HttpResponse } from '../../dto/warning.dto';
import { HttpErrorNotification } from "../components/notification/notification";
import { AppEnum, EventsEnum, TabEnum } from '../../etc/enum/app.enum';
import { Main } from "./main/main";
import { Friends } from "../friends/friends";
import { UsersHttpService } from '../../service/http/users.http.service';
import { MeService } from '../../service/user/me.service';
import { ChatsHistoryService } from '../../service/user/chats.service';
import { Notifications } from "../components/notifications/notifications";
import { NotificationService } from '../../service/user/notification.service';
import { OnSocketNotificationEnum } from '../../etc/enum/socket.enum';
import { AttachmentsPopup } from '../components/attachments/attachments-popup/attachments-popup';


@Component({
  selector: 'app-home',
  imports: [Navigator, HorizontalHeader, PopupSettingsOptions, HttpErrorNotification, Main, Friends, Notifications, AttachmentsPopup],
  providers: [DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  collapse: boolean = true
  constructor(
    private readonly comm: CommunicationService,
    private readonly meService: MeService,
    private readonly chatsService: ChatsHistoryService,
    private readonly notificationService: NotificationService
  ) { }


  response: HttpResponse | undefined
  action: TabEnum = TabEnum.HOME
  notificationState: boolean = false
  attachmentsState: boolean = false
  ngOnInit(): void {
    this.chatsService.update()
    this.meService.update()
    this.notificationService.update()

    this.comm.listen(OnSocketNotificationEnum.NOTIFICATION_RECIEVED).subscribe((res) => {
      this.notificationService.appendUnsafe(res.payload)
    })
    this.comm.listen(TabEnum.HOME).subscribe((res) => this.setAction(res))
    this.comm.listen(TabEnum.CALL_HISTORY).subscribe((res) => this.setAction(res))
    this.comm.listen(TabEnum.FRIENDS).subscribe((res) => this.setAction(res))
    this.comm.listen(AppEnum.OPEN_NOTIFICATIONS).subscribe((res) => { this.notificationState = Boolean(res.action) })
    this.comm.listen(AppEnum.OPEN_ATTACHMENTS).subscribe((res) => { this.attachmentsState = Boolean(res.action) })
  }

  setAction(res: Dispatch<any>) {
    this.action = res.action
    console.log(this.action)
  }

  get TabEnum() {
    return TabEnum
  }

  get SettingsOptions() {
    return SettingsOptions
  }

}
