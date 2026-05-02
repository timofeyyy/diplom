import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-succes-event',
  standalone: true,
  imports: [],
  templateUrl: './succes-event.html',
  styleUrls: ['./succes-event.css', '../../common/styles/common.scss'],
})
export class SuccesEvent {
  @Input()
  payload!: {
    message: string
  }
}
