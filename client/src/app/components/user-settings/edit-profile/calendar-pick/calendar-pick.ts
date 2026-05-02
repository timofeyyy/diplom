import { DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefreshHttpService } from '../../../../../service/http/refresh.service';
import { CommunicationService } from '../../../../../service/communication/communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppEnum } from '../../../../../etc/enum/app.enum';
import { UsersHttpService } from '../../../../../service/http/users.http.service';
import { MeService } from '../../../../../service/user/me.service';
import { catchError, of } from 'rxjs';
import { EventNotifierService } from '../../../events/common/services/event-notifier.service';

@Component({
  selector: 'app-calendar-pick',
  imports: [NgClass, FormsModule],
  providers: [DatePipe],
  templateUrl: './calendar-pick.html',
  styleUrls: ['../styles.css', './calendar-pick.css'],
})
export class CalendarPick implements OnInit, OnChanges {

  constructor(
    private readonly comm: CommunicationService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly usersHttp: UsersHttpService,
    private readonly datePipe: DatePipe,
    private readonly eventNotifierService: EventNotifierService,
    private readonly meService: MeService
  ) { }

  @Input()
  pickedDate: Date | undefined
  ngOnChanges(changes: SimpleChanges): void {

  }

  get PickedDate() {
    return this.pickedDate
  }

  ngOnInit(): void {
    const from = new Date(1970, 0, 1)
    const to = new Date()
    to.setFullYear(new Date().getFullYear() - 12)
    if (this.pickedDate) {
      this.currentDate = this.pickedDate.getDate()
      this.currentMonth = this.pickedDate.getMonth()
      this.currentFullYear = this.pickedDate.getFullYear()
    }
    else {
      this.currentDate = to.getDate()
      this.currentMonth = to.getMonth()
      this.currentFullYear = to.getFullYear()
    }

    this.toMonth = to.getMonth()
    this.toDate = to.getDate()
    this.toFullYear = to.getFullYear()
    this.fromMonth = from.getMonth()
    this.fromFullYear = from.getFullYear()
    for (let i = this.fromFullYear; i <= this.toFullYear; i++) {
      this.years.push(i)
    }
    this.currentMonthes = Array.from(this.monthes).slice(0, this.toMonth + 1)
    this.getCells()
  }
  @Output()
  close: EventEmitter<void> = new EventEmitter()

  currentMonthes: string[] = []
  monthes: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthStr!: string

  diplayedCells: {
    date: number,
    active: boolean
  }[] = []

  fromMonth!: number
  fromFullYear!: number
  toDate!: number
  toMonth!: number
  toFullYear!: number
  currentDate!: number
  currentMonth!: number
  currentFullYear!: number
  years: number[] = []

  pickDate(date: number) {
    this.currentDate = date
    this.pickedDate = new Date(this.currentFullYear, this.currentMonth, this.currentDate)
  }
  pickMonth(event: any) {
    const name = event.target.value
    this.currentMonth = this.monthes.findIndex((month) => name === month)
    this.getCells()
  }

  pickFullYear(event: any) {
    const year = Number(event.target.value)
    if (year == this.toFullYear) {
      this.currentMonth = this.toMonth
    }
    this.currentFullYear = year
    this.getCells()
  }

  prev() {
    if (this.fromMonth >= this.currentMonth && this.fromFullYear >= this.currentFullYear) {
      return
    }
    this.currentMonth--
    if (this.currentMonth === -1) {
      this.currentMonth = 11
      this.currentFullYear--
    }
    this.getCells()
  }

  next() {
    if (this.toMonth <= this.currentMonth && this.toFullYear <= this.currentFullYear) {
      return
    }
    this.currentMonth++
    if (this.currentMonth === 12) {
      this.currentMonth = 0
      this.currentFullYear++
    }
    this.getCells()
  }

  getCells() {
    this.diplayedCells = []
    const firstCurrent = new Date(this.currentFullYear, this.currentMonth, 1)
    const lastCurrent = new Date(this.currentFullYear, this.currentMonth + 1, 0)
    const lastPrev = new Date(this.currentFullYear, this.currentMonth, 0)
    const firstCurrentDay = firstCurrent.getDay() == 0 ? 7 : firstCurrent.getDay()
    let firstCurrentDate = firstCurrent.getDate()
    const lastCurrentDate = lastCurrent.getDate()
    let start = lastPrev.getDate() - firstCurrentDay + 2

    for (let i = 0, k = 1; i < 5; i++) {
      for (let j = 0; j < 7; j++) {
        if (i == 0 && j < firstCurrentDay - 1) {
          this.diplayedCells.push({
            active: false,
            date: start
          })
          start++
        }
        else if (firstCurrentDate <= lastCurrentDate) {
          this.diplayedCells.push({
            active: !(this.toFullYear == this.currentFullYear && this.toMonth == this.currentMonth && this.toDate <= firstCurrentDate),
            date: firstCurrentDate
          })
          firstCurrentDate++
        }
        else {
          this.diplayedCells.push({
            active: false,
            date: k
          })
          k++
        }
      }
    }
    this.currentMonthes = Array.from(this.monthes).slice(0, this.toFullYear == this.currentFullYear ? this.toMonth + 1 : 12)

    this.monthStr = this.currentMonthes[this.currentMonth]
  }

  validate() {
    this.send()
  }

  formatSpecificDate(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy.MM.dd');
  }
  send() {
    const data = this.formatSpecificDate(this.PickedDate!)
    this.comm.send(AppEnum.LOADER, { active: true })
    this.refreshHttpService.require(this.usersHttp.update("birthday", data!))
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
