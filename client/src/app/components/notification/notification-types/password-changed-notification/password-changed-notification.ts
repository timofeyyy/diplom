import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotificationDto } from '../../../../../dto/notification.dto';
import { TimeAgoPipe } from '../../../../../etc/pipes/time.ago.pipe';
import { Subscription } from 'rxjs';
import { UserDto } from '../../../../../dto/user.dto';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { SettingsOptions } from '../../../../../etc/enum/settings.enum';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { SettingsCommunicationService } from '../../../../../service/communication/settings.communication.service';
import { MeService } from '../../../../../service/user/me.service';
import { SettingsHistoryEnum } from '../../../popup-settings-options/popup-settings-options';

@Component({
  selector: 'app-password-changed-notification',
  imports: [TimeAgoPipe],
  templateUrl: './password-changed-notification.html',
  styleUrl: './password-changed-notification.css',
})
export class PasswordChangedNotification implements OnInit, OnDestroy {
  @Input()
  notification!: NotificationDto
  currentDate: Date = new Date()
  meSub?: Subscription
  me?: UserDto

  constructor(
    private readonly comm: CommunicationService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly meService: MeService
  ) { }
  ngOnInit(): void {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
    })
    setInterval(() => {
      this.currentDate = new Date()
    }, 1000)
  }
  userSetings() {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS,
      payload: {
        user: this.me,
        mode: SettingsOptions.USER_EDIT
      }
    })

    this.comm.send(AppEnum.OPEN_NOTIFICATIONS, { active: false })
  }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }
}
