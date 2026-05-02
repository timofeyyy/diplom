import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { UserSettings } from '../user-settings/user-settings';
import { SettingsLayoutHistoryService } from '../../../service/user/settings.layout.history.service';
import { Dispatch, SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { AvatarMain } from "../attachments/avatar-main/avatar-main";
import { CreateRoom } from "../create-room/create-room";

export enum SettingsHistoryEnum {
  PUSH = "push_settings_layout_data",
  POP = "pop_settings_layout_data",
  CLEAR = "clear_settings_layout_data",
}

@Component({
  selector: 'app-popup-settings-options',
  imports: [UserSettings, AvatarMain, CreateRoom],
  providers: [SettingsLayoutHistoryService],
  templateUrl: './popup-settings-options.html',
  styleUrl: './popup-settings-options.css',
})
export class PopupSettingsOptions implements OnInit {
  constructor(
    private readonly history: SettingsLayoutHistoryService,
    private readonly settingsComm: SettingsCommunicationService
  ) { }

  ngOnInit(): void {
    this.settingsComm.listen(SettingsHistoryEnum.PUSH).subscribe((data: Dispatch<SettingsOptions> | undefined) => {
      if (data) {
        this.history.push(data)
        this.action = data
      }
    })

    this.settingsComm.listen(SettingsHistoryEnum.POP).subscribe((data: Dispatch<SettingsOptions> | undefined) => {
      this.back()
    })

    this.settingsComm.listen(SettingsHistoryEnum.CLEAR).subscribe((data: Dispatch<SettingsOptions> | undefined) => {
      this.close()
    })
  }

  action: Dispatch<SettingsOptions> | undefined

  get SettingsOptions() {
    return SettingsOptions
  }
  
  get History() {
    return this.history
  }

  back() {
    this.history.pop()
    this.action = this.history.getLast()
  }

  close() {
    this.history.clear()
    this.action = undefined
  }
}
