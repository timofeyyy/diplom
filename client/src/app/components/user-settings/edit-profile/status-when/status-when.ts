import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { RefreshHttpService } from '../../../../../service/http/refresh.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { UsersHttpService } from '../../../../../service/http/users.http.service';
import { CustomOnOffSwitcher } from "../../../custom-on-off-switcher/custom-on-off-switcher";
import { MeService } from '../../../../../service/user/me.service';
import { catchError, of } from 'rxjs';
import { EventNotifierService } from '../../../events/common/services/event-notifier.service';

@Component({
  selector: 'app-status-when',
  imports: [FormsModule, CustomOnOffSwitcher],
  templateUrl: './status-when.html',
  styleUrls: ['./status-when.css'],
})
export class StatusWhen {

  constructor(
    private readonly comm: CommunicationService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly usersHttp: UsersHttpService,
    private readonly meService: MeService,
    private readonly eventNotifierService: EventNotifierService
  ) { }
  @Input()
  status: boolean = false
  @Output()
  close: EventEmitter<void> = new EventEmitter()
  send() {
    this.comm.send(AppEnum.LOADER, { active: true })
    this.refreshHttpService.require(this.usersHttp.update("lastSeenStatus", !this.status))
      .pipe(catchError((err: HttpErrorResponse) => {
        this.eventNotifierService.errorNotify(err.error.message)
        return of(err)
      }))
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

