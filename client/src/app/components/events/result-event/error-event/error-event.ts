import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-event',
  standalone: true,
  imports: [],
  templateUrl: './error-event.html',
  styleUrls: ['./error-event.css', '../../common/styles/common.scss'],
})
export class ErrorEvent {
  @Input()
  payload!: {
    message: string
  }
}
