import { Component, OnInit } from '@angular/core';
import { MeService } from '../../../../service/user/me.service';
import { UserDto } from '../../../../dto/user.dto';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { AvatarHistoryHttpService } from '../../../../service/http/avatar-history.http.service';
import { AvatarHistoryService } from '../../../../service/avatar/avatar-history.service';
import { NgClass } from '@angular/common';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { ConfirmationEnum } from '../../../../etc/enum/confirmation';
import { take } from 'rxjs';
import { RefreshHttpService } from '../../../../service/http/refresh.service';
import { UsersHttpService } from '../../../../service/http/users.http.service';
import { AvatarOptions } from '../../../../etc/enum/avatar.enum';
import { defaultAvatarSettings } from '../avatar-upload/avatar-upload';
import { AvatarSettings } from '../../../../service/avatar/avatar.dto';
export type AvatarRecord = { uri: string, date: Date, displaySettings: AvatarSettings }
export type AvatarByPeriods = [string, AvatarRecord[]][];

@Component({
  selector: 'app-avatar-history',
  imports: [NgClass],
  templateUrl: './avatar-history.html',
  styleUrl: './avatar-history.css',
})

export class AvatarHistory implements OnInit {

  // selectedUri?: string
  me!: UserDto
  displayedPeriods: AvatarByPeriods = []
  selectedAvatar?: Partial<AvatarRecord>
  // selectedAvatarSettings?: AvatarSettings
  constructor(
    private readonly meService: MeService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly avatarHistoryHttpService: AvatarHistoryHttpService,
    private readonly avatarHistoryService: AvatarHistoryService,
    private readonly usersHttp: UsersHttpService,
    private readonly comm: CommunicationService,
    private readonly refreshHttpService: RefreshHttpService,
    // private readonly avatarDisplaySettingsService: AvatarDisplaySettingsService
  ) { }

  ngOnInit(): void {
    this.meService.listen().subscribe((res) => {
      this.me = res
      if (this.me.avatar == this.me.defaultAvatar) {
        this.onAvatarSelected(undefined)
      }
      else {
        this.onAvatarSelected({ uri: this.me.avatar, displaySettings: this.me.displayAvatarSettings })
      }
    })
    this.avatarHistoryService.listen().subscribe((res) => {

      this.displayedPeriods = Object.entries(res)
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения!');
      return;
    }

    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.AVATAR_PICKER,
      payload: {
        selectedFile: file,
        mode: SettingsOptions.AVATAR_EDITOR,
        header: "Редактор"
      }
    })
  }

  deleteFromHistory(uri: string) {
    this.comm.send(ConfirmationEnum.OPEN, { action: AvatarHistory.name, confirmMessage: 'Вы удаляете картинку из истории' })
    this.comm.listen(`${AvatarHistory.name}:response`)
      .pipe(take(1))
      .subscribe((res) => {
        if (res.state) {
          const buff = uri.split('/')
          const filename = buff[buff.length - 1]
          this.refreshHttpService.require(this.avatarHistoryHttpService.remove(filename)).subscribe(() => {
            this.avatarHistoryService.update()
            if (this.me.avatar == uri) {
              this.refreshHttpService.require(this.usersHttp.update("avatarUpdate", {
                uri: this.me.defaultAvatar,
                displayAvatarSettings: defaultAvatarSettings
              }))
                .subscribe((res) => {
                  if (res?.body) {
                    this.meService.setSource(res.body)
                    this.onAvatarSelected(undefined)
                  }
                })
            }
          })

        }
      })
  }

  applyChanges() {
    this.comm.send(ConfirmationEnum.OPEN, { action: AvatarHistory.name, confirmMessage: 'Вы меняете аватар' })
    this.comm.listen(`${AvatarHistory.name}:response`)
      .pipe(take(1))
      .subscribe((res) => {
        if (res.state) {
          this.refreshHttpService.require(this.usersHttp.update("avatarUpdate", {
            uri: this.selectedAvatar?.uri ?? this.me.defaultAvatar,
            displayAvatarSettings: this.selectedAvatar?.displaySettings ?? defaultAvatarSettings
          })).subscribe((res) => {
            if (res?.body) {
              this.meService.setSource(res.body)
              this.settingsComm.send(SettingsHistoryEnum.POP)
            }
          })
        }
      })
  }

  onAvatarSelected(avatar: Partial<AvatarRecord> | undefined) {
    this.selectedAvatar = avatar
    this.comm.send(AvatarOptions.AVATAR_SELECTED, { avatar: this.selectedAvatar })
  }
}
