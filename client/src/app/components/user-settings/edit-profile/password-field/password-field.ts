import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthHttpService } from '../../../../../service/http/auth.http.service';
import { RefreshHttpService } from '../../../../../service/http/refresh.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '../../../../../dto/warning.dto';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { FromAuthMediater } from '../../../../../service/validation/auth.validation.service';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { catchError, of } from 'rxjs';
import { MeService } from '../../../../../service/user/me.service';
import { EventNotifierService } from '../../../events/common/services/event-notifier.service';

@Component({
  selector: 'app-password-field',
  imports: [NgClass, FormsModule],
  providers: [FromAuthMediater],
  templateUrl: './password-field.html',
  styleUrls: ['./password-field.css'],
})
export class PasswordField {
  constructor(
    private readonly authHttp: AuthHttpService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly comm: CommunicationService,
    private readonly authValidation: FromAuthMediater,
    private readonly eventNotifierService: EventNotifierService
  ) { }
  focus!: boolean
  @Input()
  email!: string
  newPassword!: string
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  @Output()
  save: EventEmitter<string> = new EventEmitter()
  response: HttpResponse | undefined

  async validateField() {
    this.authValidation.reset("password")
    this.authValidation.validation.password.value = this.newPassword
    const checks = this.authValidation.getChecks(["password-validation-sign-up"])
    for (const [index, check] of checks.entries()) {
      check()
    }
  }


  async validate() {
    this.authValidation.reset("password")
    this.authValidation.validation.password.value = this.newPassword
    const checks = this.authValidation.getChecks(["password-validation-sign-up"])
    this.authValidation.reset()
    for (const [index, check] of checks.entries()) {
      if (!check()) {
        return
      }
    }
    this.send()
  }
  send() {
    this.comm.send(AppEnum.LOADER, { active: true })
    this.refreshHttpService.require(this.authHttp.newPassword(this.email, this.newPassword))
      .pipe(catchError((err: HttpErrorResponse) => {
        this.eventNotifierService.errorNotify(err.error.message)
        return of(err)
      }))
      .subscribe((res: (any | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false })
        if (!(res instanceof HttpErrorResponse)) {
          this.eventNotifierService.succesNotify("Ссылка была выслана к вам на почту")
        }
        this.close.emit()
      })
  }

  get validation() {
    return this.authValidation.validation
  }
}
