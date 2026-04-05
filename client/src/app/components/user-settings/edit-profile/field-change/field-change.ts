import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserValidationService } from '../../../../../service/validation/user.validation.service';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { AuthHttpRequirementService } from '../../../../../service/http/auth.http.requirements.service';
import { AuthHttpService } from '../../../../../service/http/auth.http.service';
import { HttpResponse } from '../../../../../dto/warning.dto';
import { UsersHttpService } from '../../../../../service/http/users.http.service';
import { SettingsOptions } from '../../../../../etc/enum/settings.enum';

@Component({
  selector: 'app-field-change',
  imports: [NgClass, FormsModule],
  templateUrl: './field-change.html',
  styleUrls: ['./field-change.css', '../styles.css', '../../../../../styles/form/form.css'],
})
export class FieldChange {

  constructor(
    private readonly validation: UserValidationService,
    private readonly comm: CommunicationService,
    private readonly requirements: AuthHttpRequirementService,
    private readonly usersHttp: UsersHttpService

  ) { }

  focus!: boolean
  @Input()
  username!: string
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  @Output()
  save: EventEmitter<string> = new EventEmitter()

  warning: string | null = null
  // validateField() {
  //   const checks: ((value: string) => (string | null))[] = this.validation.getChecks(['userName'])
  //   for (const check of checks) {
  //     this.warning = check(this.username)
  //     if (this.warning) {
  //       return
  //     }
  //   }
  //   this.save.emit(this.username);
  //   this.close.emit()
  // }


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
    this.comm.send(AppEnum.LOADER, { active: true, payload: {} })

    this.requirements.require(this.usersHttp.update("userName", this.username))
      .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
        console.log(res)
        if (res instanceof HttpErrorResponse) {
        
        }
        else {
          this.comm.send(AppEnum.NOTIFICATION, {
            active: true,
            payload: res
          })
          this.comm.send(SettingsOptions.UPDATE_USER_DATA, {
                active: true, payload: res.body
              })
        }
        this.close.emit()
      })
  }

}
