import { Component, EventEmitter, Output } from '@angular/core';
import { CustomOnOffSwitcher } from '../custom-on-off-switcher/custom-on-off-switcher';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UsersHttpService } from '../../../service/http/users.http.service';
import { RefreshHttpService } from '../../../service/http/refresh.service';
import { HttpResponse } from '../../../dto/warning.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { SettingsCommunicationService } from '../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../popup-settings-options/popup-settings-options';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  imports: [CustomOnOffSwitcher, FormsModule, NgClass],
  templateUrl: './create-room.html',
  styleUrls: ['./create-room.css', '../../../styles/form/form.css'],
})
export class CreateRoom {

  constructor(
    private readonly usersHttp: UsersHttpService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly router: Router
  ) { }
  constraint: boolean = true
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
        this.router.navigateByUrl('/room')

    // this.refreshHttpService.require(this.usersHttp.createVideoRoom())
    //   .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
    //     // console.log(res)
    //     if (res instanceof HttpErrorResponse) {
    //     }
    //     else {

    //     }
    //   })
  }

  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }
}
