import { Component, OnInit } from '@angular/core';
import { Navigator } from "../navigator/navigator";
import { DatePipe } from '@angular/common';
import { HorizontalHeader } from '../components/horizontal-header/horizontal-header';
import { CommunicationService } from '../../service/communication/communication.service';
import { PopupSettingsOptions } from "../components/popup-settings-options/popup-settings-options";
import { SettingsOptions } from '../../etc/enum/settings.enum';
import { HttpResponse } from '../../dto/warning.dto';
import { AppEnum, TabEnum } from '../../etc/enum/app.enum';
import { Main } from "./main/main";
import { Friends } from "../friends/friends";
import { MeService } from '../../service/user/me.service';
import { ChatsHistoryService } from '../../service/user/chats.service';
import { Notifications } from "../components/notification/notifications/notifications";
import { NotificationService } from '../../service/user/notification.service';
import { AttachmentsPopup } from '../components/attachments/attachments-popup/attachments-popup';
import { ThemePicker } from "../../themes/theme-picker/theme-picker";
import { AvatarHistoryService } from '../../service/avatar/avatar-history.service';
import { FreindsService } from '../../service/user/friends.service';
import { take } from 'rxjs';
import { NotificationCounterService } from '../components/notification/service/notification-counter.service';


@Component({
  selector: 'app-home',
  imports: [
    Navigator,
    HorizontalHeader,
    PopupSettingsOptions,
    Friends,
    Notifications,
    AttachmentsPopup,
    ThemePicker
  ],
  providers: [DatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../../styles/styles.css'],
})
export class Home implements OnInit {

  collapse: boolean = true
  response: HttpResponse | undefined
  action: TabEnum = TabEnum.HOME
  notificationState: boolean = false
  attachmentsState: boolean = false
  themesState: boolean = false

  constructor(
    private readonly comm: CommunicationService,
    private readonly meService: MeService,
    private readonly chatsService: ChatsHistoryService,
    private readonly notificationService: NotificationService,
    private readonly notificationCounterService: NotificationCounterService,
    private readonly avatarHistoryService: AvatarHistoryService,
    private readonly friendService: FreindsService
  ) { }

  get TabEnum() {
    return TabEnum
  }

  get SettingsOptions() {
    return SettingsOptions
  }

  ngOnInit(): void {
    this.chatsService.update()
    this.meService.update()
    this.avatarHistoryService.update()
    this.notificationService.update()
    this.notificationCounterService.update()
    this.meService.listen()
      .pipe(take(1))
      .subscribe((res) => {
        this.friendService.update(res._id)
      })

    this.comm.listen(TabEnum.HOME).subscribe((res) => this.action = TabEnum.HOME)
    this.comm.listen(TabEnum.CALL_HISTORY).subscribe((res) => this.action = TabEnum.CALL_HISTORY)
    this.comm.listen(TabEnum.FRIENDS).subscribe((res) => this.action = TabEnum.FRIENDS)
    this.comm.listen(AppEnum.OPEN_NOTIFICATIONS).subscribe((res) => { this.notificationState = res.active })
    this.comm.listen(AppEnum.OPEN_ATTACHMENTS).subscribe((res) => { console.log(res); this.attachmentsState = res.active })
    this.comm.listen(AppEnum.OPEN_THEMES).subscribe((res) => { this.themesState = res.state })
  }
}
