import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { NgIf } from '@angular/common';
import { AuthHttpRequirementService } from '../../../service/http/auth.http.requirements.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AuthHttpService } from '../../../service/http/auth.http.service';
import { lastValueFrom, Subscribable, Subscription, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';
import { UserSettings } from '../user-settings/user-settings';
import { AuthActions, SettingsOptions } from '../../../etc/enum/settings.enum';
import { CommunicationService } from '../../../service/communication/communication.service';
import { AppEnum } from '../../../etc/enum/app.enum';
import { MeService } from '../../../service/user/me.service';

@Component({
  selector: 'app-popup-setting-overview-menu',
  imports: [],
  providers: [],
  templateUrl: './popup-setting-overview-menu.html',
  styleUrl: './popup-setting-overview-menu.css',
})
export class PopupSettingOverviewMenu implements OnInit, OnDestroy {
  constructor(
    private readonly authHttp: AuthHttpService,
    private readonly authHttpRequirements: AuthHttpRequirementService,
    private readonly router: Router,
    private readonly eRef: ElementRef,
    private readonly comm: CommunicationService,
    private readonly meService: MeService

  ) { }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }

  me?: UserDto
  meSub?: Subscription
  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res.payload
    })
  }

  @Output()
  action: EventEmitter<string> = new EventEmitter()
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  logout() {
    this.authHttpRequirements.require(this.authHttp.logout())
      .subscribe((res: (null | HttpErrorResponse)) => {
        if (!res) {
          this.comm.send(AuthActions.LOG_OUT, { active: false, payload: {} })
        }
        else {
          console.log(res.message)
        }
      })
  }

  userSetings() {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: true,
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
}
