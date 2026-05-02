import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { FormsModule } from '@angular/forms';
import { ViewProfile } from "./view-profile/view-profile";
import { EditProfile } from "./edit-profile/edit-profile";
import { ViewOtherProfile } from './view-other-profile/view-other-profile';
import { SettingsLayoutHistoryService } from '../../../service/user/settings.layout.history.service';
import { SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../popup-settings-options/popup-settings-options';

@Component({
  selector: 'app-user-settings',
  imports: [FormsModule, ViewProfile, EditProfile, ViewOtherProfile],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.css',
})
export class UserSettings {
  @ViewChild("window", { static: false })
  window: ElementRef | undefined;
  @Input()
  user!: UserDto
  @Input()
  state!: SettingsOptions
  @Input()
  header!: string
  
  constructor(
    private readonly settingsComm: SettingsCommunicationService,
    private readonly history: SettingsLayoutHistoryService
  ) { }

  get History() {
    return this.history
  }

  get SettingsOptions() {
    return SettingsOptions
  }
  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }
  back() {
    this.settingsComm.send(SettingsHistoryEnum.POP)
  }

  openNewWindow(action: SettingsOptions) {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS, payload: {
        user: this.user,
        mode: action,
        header: "Редактирование"
      }
    })
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;

    const clickedInsideNotification = target.closest('.notification');
    if (
      this.window &&
      !this.window.nativeElement.contains(target) &&
      !clickedInsideNotification
    ) {
      this.close();
    }
  }
}
