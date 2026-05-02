import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { CommunicationService } from '../../../service/communication/communication.service';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { DisplayStatusPipe } from '../../../etc/pipes/display.status.pipe';
import { AsyncPipe, DatePipe } from '@angular/common';
import { SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../popup-settings-options/popup-settings-options';
import { Avatar } from "../avatar/avatar";

@Component({
  selector: 'app-people-list',
  imports: [DisplayStatusPipe, AsyncPipe, Avatar],
  providers: [DisplayStatusPipe],
  templateUrl: './people-list.html',
  styleUrl: './people-list.css',
})
export class PeopleList {
  constructor(
    private readonly comm: CommunicationService,
    private readonly displayStatus: DisplayStatusPipe,
    private readonly settingsComm: SettingsCommunicationService
  ) { }
  @Input()
  command: ((user: Partial<UserDto>, index: number) => void) | undefined
  openSettings(user: Partial<UserDto>) {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS,
      payload: {
        user: user,
        mode: SettingsOptions.OTHER_USER_VIEW
      }
    })
  }

  execCommand(user: Partial<UserDto>, index: number) {
    if (this.command) {
      this.command(user, index)
    }
  }
  @Input()
  loader: boolean = false

  @Input()
  currentList: Partial<UserDto>[] | undefined = []
}
