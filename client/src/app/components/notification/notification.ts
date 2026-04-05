import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpResponse } from '../../../dto/warning.dto';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [NgClass],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class HttpErrorNotification {
  @Input()
  body!: HttpResponse
  hide!: boolean

  @Output()
  closeEvent: EventEmitter<void> = new EventEmitter()
  close() {
    this.hide = true
    setTimeout(() => {
      this.closeEvent.emit()
    }, 300);
  }
}
