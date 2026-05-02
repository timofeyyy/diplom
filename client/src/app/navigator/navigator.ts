import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserAction } from '../../etc/enum/auth.enum';
import { CommunicationService } from '../../service/communication/communication.service';
import { TabEnum } from '../../etc/enum/app.enum';

@Component({
  selector: 'app-navigator',
  imports: [NgClass],
  templateUrl: './navigator.html',
  styleUrl: './navigator.css',
})
export class Navigator {
  @Input()
  collapse: boolean = true
  constructor(
    private readonly router: Router,
    private readonly comm: CommunicationService
  ) {}
  action: TabEnum = TabEnum.HOME
  open(action: TabEnum) {
    this.action = action
    this.comm.send(action)
  }

  get TabEnum() {
    return TabEnum
  }
}
