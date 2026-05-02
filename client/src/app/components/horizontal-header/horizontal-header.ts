import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopupSettingOverviewMenu } from '../popup-setting-overview-menu/popup-setting-overview-menu';
import { UserDto } from '../../../dto/user.dto';
import { MeService } from '../../../service/user/me.service';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../../../service/communication/communication.service';
import { AppEnum } from '../../../etc/enum/app.enum';
import { NotificationCounters, NotificationService } from '../../../service/user/notification.service';
import { NgStyle } from '@angular/common';
import { Avatar } from "../avatar/avatar";
import { NotificationCounterService } from '../notification/service/notification-counter.service';

@Component({
  selector: 'app-horizontal-header',
  imports: [PopupSettingOverviewMenu, Avatar],
  templateUrl: './horizontal-header.html',
  styleUrl: './horizontal-header.css',
})
export class HorizontalHeader implements OnInit, OnDestroy {
  openSettings!: boolean
  me?: UserDto
  meSub?: Subscription
  notoficationSub?: Subscription
  notificationWindowStateSub?: Subscription
  firstCounter?: number
  updatedCounter?: number
  notfication: boolean = false

  constructor(
    private readonly meService: MeService,
    private readonly comm: CommunicationService,
    private readonly notificationCounterService: NotificationCounterService,
  ) { }

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
    })
    this.notificationCounterService.listen().subscribe((res: NotificationCounters) => {
      console.log(res)
      if (res) {
        this.updatedCounter = res[0] + res[1] + res[2]
      }
    })
    this.notificationWindowStateSub = this.comm.listen(AppEnum.OPEN_NOTIFICATIONS).subscribe((res) => {
      this.notfication = res.active
    })
  }

  notifications() {
    const notfication = !this.notfication
    this.comm.send(AppEnum.OPEN_NOTIFICATIONS, { active: notfication, payload: {} })
    this.updatedCounter = undefined
  }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
    this.notoficationSub?.unsubscribe()
    this.notificationWindowStateSub?.unsubscribe()
  }
}
