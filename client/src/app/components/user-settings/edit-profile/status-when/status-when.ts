import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { AuthHttpRequirementService } from '../../../../../service/http/auth.http.requirements.service';
import { HttpResponse } from '../../../../../dto/warning.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { SettingsOptions } from '../../../../../etc/enum/settings.enum';
import { UsersHttpService } from '../../../../../service/http/users.http.service';

@Component({
  selector: 'app-status-when',
  imports: [FormsModule],
  templateUrl: './status-when.html',
  styleUrls: ['./status-when.css', '../styles.css'],
})
export class StatusWhen {
  constructor(
    private readonly comm: CommunicationService,
    private readonly requirements: AuthHttpRequirementService,
    private readonly usersHttp: UsersHttpService,
  ) { }
  @Input()
  status?: "Display" | "Hide"
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  send() {
    this.comm.send(AppEnum.LOADER, { active: true, payload: {} })

    this.requirements.require(this.usersHttp.update("lastSeenStatus", this.status == 'Display' ? true : false))
      .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
        this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
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
