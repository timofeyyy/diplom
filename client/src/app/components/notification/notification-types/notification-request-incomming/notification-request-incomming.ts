import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
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
  selector: 'app-notification-request-incomming',
  imports: [TimeAgoPipe, Avatar],
  templateUrl: './notification-request-incomming.html',
  styleUrl: './notification-request-incomming.css',
})
export class NotificationRequestIncomming {
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
    }, 1000)
    console.log(this.notification)
  }

  getAvatarUrl(url: string) {
    return `url("${url}")`;
  }

  async userSetings() {
    this.friendService.listen(this.notification.data.senderId).subscribe((res) => {
      this.settingsComm.send(SettingsHistoryEnum.PUSH, {
        action: SettingsOptions.USER_SETTINGS,
        payload: {
          user: res,
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
