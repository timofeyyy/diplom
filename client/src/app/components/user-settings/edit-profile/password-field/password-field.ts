import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthHttpService } from '../../../../../service/http/auth.http.service';
import { AuthHttpRequirementService } from '../../../../../service/http/auth.http.requirements.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '../../../../../dto/warning.dto';
import { HttpErrorNotification } from "../../../notification/notification";
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { FromAuthMediater } from '../../../../../service/validation/auth.validation.service';
import { LoaderComponent } from "../../../loader/loader.component";
import { AppEnum } from '../../../../../etc/enum/app.enum';

@Component({
  selector: 'app-password-field',
  imports: [NgClass, FormsModule],
  providers: [FromAuthMediater],
  templateUrl: './password-field.html',
  styleUrls: ['./password-field.css', '../styles.css'],
})
export class PasswordField {
  constructor(
    private readonly authHttp: AuthHttpService,
    private readonly authHttpRequirements: AuthHttpRequirementService,
    private readonly comm: CommunicationService,
    private readonly authValidation: FromAuthMediater
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
    console.log(checks)
    this.authValidation.reset()
    for (const [index, check] of checks.entries()) {
      if (!check()) {
        return
      }
    }
    this.send()
  }
  send() {
    this.comm.send(AppEnum.LOADER, { active: true, payload: {} })

    this.authHttpRequirements.require(this.authHttp.newPassword(this.email, this.newPassword))
      .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
        if (res instanceof HttpErrorResponse) {
        }
        else {
          this.comm.send(AppEnum.NOTIFICATION, {
            active: true,
            payload: res
          })
        }
        this.close.emit()
      })
  }

  get validation() {
    return this.authValidation.validation
  }
}
