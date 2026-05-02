import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { RefreshHttpService } from '../../../service/http/refresh.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthHttpService } from '../../../service/http/auth.http.service';
import { Subscription } from 'rxjs';
import { AuthActions, SettingsOptions } from '../../../etc/enum/settings.enum';
import { CommunicationService } from '../../../service/communication/communication.service';
import { AppEnum } from '../../../etc/enum/app.enum';
import { MeService } from '../../../service/user/me.service';
import { SettingsHistoryEnum } from '../popup-settings-options/popup-settings-options';
import { SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-popup-setting-overview-menu',
  imports: [Avatar],
  providers: [],
  templateUrl: './popup-setting-overview-menu.html',
  styleUrl: './popup-setting-overview-menu.css',
})
export class PopupSettingOverviewMenu implements OnInit, OnDestroy {

  me?: UserDto
  meSub?: Subscription
  @Output()
  action: EventEmitter<string> = new EventEmitter()
  @Output()
  close: EventEmitter<void> = new EventEmitter()

  constructor(
    private readonly authHttp: AuthHttpService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly eRef: ElementRef,
    private readonly comm: CommunicationService,
    private readonly meService: MeService,
    private readonly settingsComm: SettingsCommunicationService,
  ) { }

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
    })
  }

  logout() {
    this.refreshHttpService.require(this.authHttp.logout())
      .subscribe((res: (null | HttpErrorResponse)) => {
        if (!res) {
          this.comm.send(AuthActions.LOG_OUT)
        }
        else {
          // console.log(res.message)
        }
      })
  }

  userSetings() {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS,
      payload: {
        user: this.me,
        mode: SettingsOptions.USER_VIEW
      }
    })

    this.close.emit()
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.close.emit()
    }
  }

  themes() {
    this.comm.send(AppEnum.OPEN_THEMES, { state: true })
    this.close.emit()
  }

  getAvatarUrl(url: string) {
    return `url("${url}")`;
  }
  
  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }
}
