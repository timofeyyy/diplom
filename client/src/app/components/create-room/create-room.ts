import { Component, EventEmitter, Output } from '@angular/core';
import { CustomOnOffSwitcher } from '../custom-on-off-switcher/custom-on-off-switcher';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UsersHttpService } from '../../../service/http/users.http.service';
import { AuthHttpRequirementService } from '../../../service/http/auth.http.requirements.service';
import { HttpResponse } from '../../../dto/warning.dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-room',
  imports: [CustomOnOffSwitcher, FormsModule, NgClass],
  templateUrl: './create-room.html',
  styleUrls: ['./create-room.css', '../../../styles/form/form.css'],
})
export class CreateRoom {

  constructor(
    private readonly usersHttp: UsersHttpService,
    private readonly requirements: AuthHttpRequirementService,
  ) { }

  validateField() {

  }
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  constaint: boolean = true
  validationOptions = {
    count: {
      value: null,
      warning: null,
      focus: false
    }
  }
  preventInvalid(event: KeyboardEvent) {
    const allowed = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (allowed.includes(event.key)) return;

    const current = Number(this.validationOptions.count.value || '');
    const next = Number(current.toString() + event.key);

    if (isNaN(next) || next > 10) {
      event.preventDefault();
    }
  }

  createAndJoin() {
    this.requirements.require(this.usersHttp.createVideoRoom())
      .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
        console.log(res)
        // this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
        if (res instanceof HttpErrorResponse) {
        }
        else {
          // this.comm.send(AppEnum.NOTIFICATION, {
          //   active: true,
          //   payload: res
          // })
          // this.comm.send(SettingsOptions.UPDATE_USER_DATA, {
          //   active: true, payload: res.body
          // })
        }
        // this.close.emit()
      })
  }
}
