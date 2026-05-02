import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { SettingsLayoutHistoryService } from '../../../../service/user/settings.layout.history.service';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { AvatarHistory, AvatarRecord } from "../avatar-history/avatar-history";
import { AvatarUpload } from "../avatar-upload/avatar-upload";
import { CommunicationService } from '../../../../service/communication/communication.service';
import { AvatarOptions } from '../../../../etc/enum/avatar.enum';

@Component({
  selector: 'app-avatar-main',
  imports: [AvatarHistory, AvatarUpload],
  templateUrl: './avatar-main.html',
  styleUrl: './avatar-main.css',
})
export class AvatarMain implements OnInit {

  @Input()
  state!: SettingsOptions
  @Input()
  selectedFile!: any
  @Input()
  header!: string
  @Input()
  selectedAvatar?: Partial<AvatarRecord>

  constructor(
    private readonly comm: CommunicationService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly history: SettingsLayoutHistoryService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  get History() {
    return this.history
  }

  get SettingsOptions() {
    return SettingsOptions
  }

  ngOnInit(): void {
    this.comm.listen(AvatarOptions.AVATAR_SELECTED).subscribe((res) => {
      // console.log(res)
      this.selectedAvatar = res.avatar
      // this.header = "Редактирование"
      this.cdr.detectChanges()
    })
  }

  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }
  back() {
    this.settingsComm.send(SettingsHistoryEnum.POP)
  }

  openNewWindow(action: SettingsOptions, payload: any) {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.AVATAR_PICKER, payload: {
        ...payload,
        mode: action
      }
    })
  }
} 
