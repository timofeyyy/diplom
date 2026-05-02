import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserValidationService } from '../../../../../service/validation/user.validation.service';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { RefreshHttpService } from '../../../../../service/http/refresh.service';
import { UsersHttpService } from '../../../../../service/http/users.http.service';
import { MeService } from '../../../../../service/user/me.service';
import { catchError, of } from 'rxjs';
import { EventNotifierService } from '../../../events/common/services/event-notifier.service';

@Component({
  selector: 'app-field-change',
  imports: [NgClass, FormsModule],
  templateUrl: './field-change.html',
  styleUrls: ['./field-change.css'],
})
export class FieldChange {

  constructor(
    private readonly validation: UserValidationService,
    private readonly comm: CommunicationService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly usersHttp: UsersHttpService,
    private readonly meService: MeService,
    private readonly eventNotifierService: EventNotifierService
  ) { }

  focus!: boolean
  @Input()
  username!: string
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  @Output()
  save: EventEmitter<string> = new EventEmitter()
  warning: string | null = null

  async validateField() {
    const checks: ((value: string) => (string | null))[] = this.validation.getChecks(['userName'])
    for (const check of checks) {
      this.warning = check(this.username)
      if (this.warning) {
        return
      }
    }
  }

  async validate() {
    const checks: ((value: string) => (string | null))[] = this.validation.getChecks(['userName'])
    this.warning = null
    for (const [index, check] of checks.entries()) {
      this.warning = check(this.username)
      if (this.warning) {
        return
      }
    }
    this.send()
  }

  send() {
    this.comm.send(AppEnum.LOADER, { active: true })
    this.refreshHttpService.require(this.usersHttp.update("userName", this.username))
      .pipe(catchError((err: HttpErrorResponse) => of(err)))
      .subscribe((res: (any | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false })
        if (!(res instanceof HttpErrorResponse)) {
          this.meService.setSource(res.body)
          this.eventNotifierService.succesNotify("Профиль был обновлен")
        }
        this.close.emit()
      })
  }
}
