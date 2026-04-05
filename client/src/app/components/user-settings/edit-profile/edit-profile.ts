import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { FieldChange } from "./field-change/field-change";
import { UserFields } from '../../../../etc/enum/settings.enum';
import { CalendarPick } from "./calendar-pick/calendar-pick";
import { PasswordField } from "./password-field/password-field";
import { UserValidationService } from '../../../../service/validation/user.validation.service';
import { StatusWhen } from "./status-when/status-when";
import { DatePipe } from '@angular/common';
import { MeService } from '../../../../service/user/me.service';
import { lastValueFrom, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  imports: [FieldChange, CalendarPick, DatePipe, PasswordField, StatusWhen],
  providers: [UserValidationService, DatePipe],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit, OnDestroy {
  constructor(
    private readonly datePipe: DatePipe,
    private readonly meService: MeService
  ) { }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }

  me?: UserDto
  meSub?: Subscription
  meDate: Date | undefined

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res.payload
      const date = Date.parse(this.me!.birthday!)
      if (this.me!.birthday && !isNaN(date)) {
        this.meDate = new Date(date)
      }
    })


  }
  state: UserFields | undefined

  get UserFields() {
    return UserFields
  }
}
