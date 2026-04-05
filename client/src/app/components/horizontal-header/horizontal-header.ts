import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PopupSettingOverviewMenu } from '../popup-setting-overview-menu/popup-setting-overview-menu';
import { NgIf } from '@angular/common';
import { UserDto } from '../../../dto/user.dto';
import { MeService } from '../../../service/user/me.service';
import { lastValueFrom, Subscription, take } from 'rxjs';
import { CommunicationService } from '../../../service/communication/communication.service';
import { AppEnum } from '../../../etc/enum/app.enum';
import { ChatsHistoryService } from '../../../service/user/chats.service';
import { NotificationService } from '../../../service/user/notification.service';

@Component({
  selector: 'app-horizontal-header',
  imports: [PopupSettingOverviewMenu],
  templateUrl: './horizontal-header.html',
  styleUrl: './horizontal-header.css',
})
export class HorizontalHeader implements OnInit, OnDestroy {
  openSettings!: boolean
  constructor(
    private readonly meService: MeService,
    private readonly comm: CommunicationService,
    private readonly notificationService: NotificationService
  ) { }
  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }

  me?: UserDto
  meSub?: Subscription
  notoficationSub?: Subscription
  firstCounter?: number
  updatedCounter?: number
  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res.payload
    })
    this.notoficationSub = this.notificationService.listen().subscribe((res) => {
      console.log(res)
      if(!res.payload) {
        return
      }
      if(this.firstCounter) {
        this.updatedCounter = res.payload.length - this.firstCounter
      }
      else {
        this.firstCounter = res.payload.length
      }
      console.log(this.firstCounter, this.updatedCounter)
    })
  }

  notfication: boolean = false
  notifications() {
    this.notfication = !this.notfication
    this.comm.send(AppEnum.OPEN_NOTIFICATIONS, { active: this.notfication, payload: {}})
    this.updatedCounter = undefined
  }
}
