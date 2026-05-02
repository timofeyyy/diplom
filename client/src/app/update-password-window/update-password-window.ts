import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Route, Router } from '@angular/router';
import { AuthHttpService } from '../../service/http/auth.http.service';
import { RefreshHttpService } from '../../service/http/refresh.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '../../dto/warning.dto';
import { catchError, of } from 'rxjs';
import { AppEnum } from '../../etc/enum/app.enum';
import { CommunicationService } from '../../service/communication/communication.service';
import { EventNotifierService } from '../components/events/common/services/event-notifier.service';

@Component({
  selector: 'app-update-password-window',
  imports: [],
  providers: [],
  templateUrl: './update-password-window.html',
  styleUrl: './update-password-window.css',
})
export class UpdatePasswordWindow implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authHttp: AuthHttpService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly eventNotifierService: EventNotifierService
  ) { }

  response!: HttpResponse
  ngOnInit(): void {
    const passid = this.activatedRoute.snapshot.paramMap.get('passid')
    if (passid) {
      this.refreshHttpService.require(this.authHttp.updatePassword(passid))
        .pipe(catchError((err: HttpErrorResponse) => {
          this.eventNotifierService.errorNotify(err.error.message)
          return of(err)
        }))
        .subscribe((res: (any | HttpErrorResponse)) => {
          this.response = { statusCode: res.status, transcript: res.statusText, message: res.message ?? res.body?.message, body: {} }
          // if (res.status < 400) {
          //   this.logout()
          // }
          if (!(res instanceof HttpErrorResponse)) {
            this.logout()
            this.eventNotifierService.succesNotify("Профиль был обновлен")
          }
        })

    }
  }
  logout() {
    this.refreshHttpService.require(this.authHttp.logout())
      .subscribe()
  }
  auth() {
    this.router.navigate(['/user-auth'])
  }
}
