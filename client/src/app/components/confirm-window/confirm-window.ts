import { Component, Input } from '@angular/core';
import { CommunicationService } from '../../../service/communication/communication.service';
import { ConfirmationEnum } from '../../../etc/enum/confirmation';

@Component({
  selector: 'app-confirm-window',
  imports: [],
  templateUrl: './confirm-window.html',
  styleUrl: './confirm-window.css',
})
export class ConfirmWindow {
 
  constructor(
    private readonly comm: CommunicationService
  ) { }

  @Input()
  action?: string
  @Input()
  confirmMessage?: string

  ok() {
    this.comm.send(`${this.action}:response`, { state: true })
    this.close()
  }

  cancel() {
    this.comm.send(`${this.action}:response`, { state: false })
    this.close()
  }

  close() {
    this.comm.send(ConfirmationEnum.OPEN)
  }
}
