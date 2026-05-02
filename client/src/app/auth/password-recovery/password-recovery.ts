import { Component, EventEmitter, Output } from '@angular/core';
import { FromAuthMediater } from '../../../service/validation/auth.validation.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../service/communication/communication.service';
import { HttpResponse } from '../../../dto/warning.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../etc/enum/app.enum';
import { AuthHttpService } from '../../../service/http/auth.http.service';
import { RefreshHttpService } from '../../../service/http/refresh.service';
import { EventNotifierService } from '../../components/events/common/services/event-notifier.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-password-recovery',
  imports: [NgClass, FormsModule],
  templateUrl: './password-recovery.html',
  styleUrls: ['../auth.css', './password-recovery.css'],
})
export class PasswordRecovery {
  constructor(
    private readonly authHttp: AuthHttpService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly authValidation: FromAuthMediater,
    private readonly comm: CommunicationService,
    private readonly eventNotifierService: EventNotifierService
  ) { }
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  validateField(keys: string[]) {
    const checks: (() => boolean)[] = this.authValidation.getChecks(keys)
    for (const check of checks) {
      if (!check()) {
        return
      }
    }
  }

  async validateForm() {
    const checks: (() => boolean)[] = this.authValidation.getChecks(['email', 'email-domen', 'password-validation-sign-up', 'email-exists'])
    this.authValidation.reset()
    for (const [index, check] of checks.entries()) {
      const res = await check()
      if (!res) {
        return
      }
    }
    this.comm.send(AppEnum.LOADER, { active: true })
    this.refreshHttpService.require(this.authHttp.newPassword(this.authValidation.validation.email.value!, this.authValidation.validation.password.value!))
      .pipe(catchError((err: HttpErrorResponse) => {
        this.eventNotifierService.errorNotify(err.error.message)
        return of(err)
      }))
      .subscribe((res: (any | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false })
        if (!(res instanceof HttpErrorResponse)) {
          this.eventNotifierService.succesNotify("Профиль был обновлен")
        }
        this.close.emit()
      })
  }

  get getAuthValidation() {
    return this.authValidation
  }
} 
