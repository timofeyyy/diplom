import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { FieldChange } from "./field-change/field-change";
import { SettingsOptions, UserFields } from '../../../../etc/enum/settings.enum';
import { CalendarPick } from "./calendar-pick/calendar-pick";
import { PasswordField } from "./password-field/password-field";
import { UserValidationService } from '../../../../service/validation/user.validation.service';
import { StatusWhen } from "./status-when/status-when";
import { DatePipe, NgStyle } from '@angular/common';
import { MeService } from '../../../../service/user/me.service';
import { Subscription } from 'rxjs';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { Avatar } from "../../avatar/avatar";

@Component({ 
  selector: 'app-edit-profile',
  imports: [FieldChange, CalendarPick, DatePipe, PasswordField, StatusWhen,Avatar],
  providers: [UserValidationService, DatePipe],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit, OnDestroy {

  me?: UserDto
  meSub?: Subscription
  meDate: Date | undefined
  state: UserFields | undefined

  constructor(
    private readonly meService: MeService,
    private readonly settingsComm: SettingsCommunicationService,
  ) { }

  get UserFields() {
    return UserFields
  }

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
      const date = Date.parse(this.me!.birthday!)
      if (this.me!.birthday && !isNaN(date)) {
        this.meDate = new Date(date)
      }
    })
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения!');
      return;
    }
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.AVATAR_PICKER,
      payload: {
        avatar: file,
      }
    })
  }

  onAvatarEditor() {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.AVATAR_PICKER,
      payload: {
        mode: SettingsOptions.AVATAR_HISTORY,
        header: "Последние"
      }
    })
  }

  getAvatarUrl(url: string) {
    return `url("${url}")`;
  }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }
}
