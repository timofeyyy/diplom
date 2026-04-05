import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../service/config/app-config.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FromAuthDto } from '../../dto/warning.dto';
import { FormsModule } from '@angular/forms';
import { AlertWindow } from '../components/alert-window/alert-window';
import { FromAuthMediater } from '../../service/validation/auth.validation.service';
import { AuthHttpService } from '../../service/http/auth.http.service';
import { HttpErrorNotification } from "../components/notification/notification";
import { LoaderComponent } from '../components/loader/loader.component';
import { AuthActions } from '../../etc/enum/settings.enum';
import { PasswordRecovery } from "./password-recovery/password-recovery";
import { lastValueFrom } from 'rxjs';
import { CommunicationService } from '../../service/communication/communication.service';
import { AppEnum, EventsEnum } from '../../etc/enum/app.enum';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, NgClass, PasswordRecovery],
  providers: [FromAuthMediater, AuthHttpService],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit {

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AppConfigService,
    private readonly authValidation: FromAuthMediater,
    private readonly authHttp: AuthHttpService,
    private readonly comm: CommunicationService
  ) { }

  config: any
  ngOnInit(): void {
    this.config = this.appConfig.getAll()

    window.addEventListener('message', (event) => {
      if (event.origin !== this.config['nest-origin']) return;

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        this.comm.send(EventsEnum.LOGGED_IN, { active: true, payload: {} })
      }
    });

  }

  login: boolean = true

  validateField(keys: string[]) {
    const checks: (() => boolean)[] = this.getAllFieldChecks(keys)
    for (const check of checks) {
      if (!check()) {
        return
      }
    }
  }
  getAllFieldChecks(keys: string[]) {
    return this.authValidation.getChecks(keys)
  }
  loader!: boolean
  action!: AuthActions
  async validateForm() {
    const checks: (() => boolean)[] = this.getAllChecks()
    this.authValidation.reset()
    this.comm.send(AppEnum.LOADER, { active: true, payload: {} })
    for (const [index, check] of checks.entries()) {
      const res = await check()
      if (!res) {
        this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
        return
      }
    }
    if (!this.login) {
      try {
        const httpAnswer = this.authHttp.login(this.authValidation.validation.email.value!, this.authValidation.validation.password.value!)
        await lastValueFrom(httpAnswer);
      }
      catch {

      }
      this.comm.send(AppEnum.LOADER, { active: false, payload: {} })

    }
    else {
      this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
    }
  }

  getAllChecks() {
    return this.login ? this.authValidation.getChecks(['email', 'password-validation-log-in', 'log-in']) : this.authValidation.getChecks(['email', 'email-domen', 'password-validation-sign-up', 'password-repeat', 'sign-up'])
    // return this.login ? this.authValidation.getLoginChecks() : this.authValidation.getSignInChecks()
  }
  // closeAlert() {
  //   this.alertWindow = false
  //   // this.authValidation.reset("alertWindowError")
  // }

  changeEnterType() {
    this.login = !this.login
    this.getAuthValidation.reset()
    this.router.navigate(
      [],
      {
        queryParams: { enterType: this.login ? AuthActions.LOG_IN : AuthActions.SIGN_UP },
        queryParamsHandling: 'merge',
        relativeTo: this.route
      }
    ).catch(() => {
      this.login = !this.login
    })
  }



  // get alertWindow() {
  //   return this.authValidation.alertWindow
  // }
  set alertWindow(value: boolean) {
    this.authValidation.alertWindow = value

  }
  get getAuthValidation() {
    return this.authValidation
  }
  get AuthActions() {
    return AuthActions
  }
}

