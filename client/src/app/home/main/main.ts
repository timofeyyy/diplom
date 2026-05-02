import { Component } from '@angular/core';
import { UserAction } from '../../../etc/enum/auth.enum';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { CreateRoom } from "../../components/create-room/create-room";
import { SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../../components/popup-settings-options/popup-settings-options';
 
@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  action: UserAction | undefined

  constructor(
    private readonly settingsComm: SettingsCommunicationService
  ) { }

  doAction(action: string) {
    this.action = action as UserAction
    // console.log(action)
  }

  createRoom() {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.CONFERENCE_CREATE, payload: {
      }
    })
  }

  get SettingsOptions() {
    return SettingsOptions
  }
}
