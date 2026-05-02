import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { lastValueFrom, Subscription, take } from 'rxjs';
import { NotificationDto } from '../../../../../dto/notification.dto';
import { UserDto } from '../../../../../dto/user.dto';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { SettingsOptions } from '../../../../../etc/enum/settings.enum';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { SettingsCommunicationService } from '../../../../../service/communication/settings.communication.service';
import { MeService } from '../../../../../service/user/me.service';
import { SettingsHistoryEnum } from '../../../popup-settings-options/popup-settings-options';
import { TimeAgoPipe } from '../../../../../etc/pipes/time.ago.pipe';
import { Avatar } from "../../../avatar/avatar";
import { FreindsService } from '../../../../../service/user/friends.service';

@Component({
  selector: 'app-notification-request-mutually',
  imports: [TimeAgoPipe, Avatar],
  templateUrl: './notification-request-mutually.html',
  styleUrl: './notification-request-mutually.css',
})
export class NotificationRequestMutually implements OnInit, OnDestroy {
  @Input()
  notification!: NotificationDto
  currentDate: Date = new Date()
  meSub?: Subscription
  me?: UserDto

  constructor(
    private readonly comm: CommunicationService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly meService: MeService,
    private readonly friendService: FreindsService
  ) { }
  ngOnInit(): void {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
    })
    setInterval(() => {
      this.currentDate = new Date()
    }, 10000)
  }
  userSetings() {
    this.friendService.listen(this.me?._id!)
      .pipe(take(1))
      .subscribe((res: UserDto[]) => {
        const opponent = res.find((user) => user._id == this.notification.data.senderId)
        this.settingsComm.send(SettingsHistoryEnum.PUSH, {
          action: SettingsOptions.USER_SETTINGS,
          payload: {
            user: opponent,
            mode: SettingsOptions.OTHER_USER_VIEW
          }
        })
      })

    this.comm.send(AppEnum.OPEN_NOTIFICATIONS, { active: false })
  }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }
}
