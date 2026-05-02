import { Component, Input, OnInit } from '@angular/core';
import { FriendStatusEnum, NotificationMainTypes, NotificationTypes } from '../../../../../etc/enum/notification.enum';
import { NotificationDto } from '../../../../../dto/notification.dto';
import { NotificationRequestMutually } from "../../notification-types/notification-request-mutually/notification-request-mutually";
import { NotificationRequestIncomming } from "../../notification-types/notification-request-incomming/notification-request-incomming";
import { NotificationCounterService } from '../../service/notification-counter.service';

@Component({
  selector: 'app-notification-request',
  imports: [NotificationRequestMutually, NotificationRequestIncomming],
  templateUrl: './notification-request.html'
})
export class NotificationRequest implements OnInit {
  
  @Input()
  notifications: NotificationDto[] = []

  constructor(
    private readonly notificationCounterService: NotificationCounterService
  ) { }

  get FriendStatusEnum() {
    return FriendStatusEnum
  }

  ngOnInit(): void {
    this.notificationCounterService.markAsReaded(NotificationMainTypes.REQUESTS, this.notifications)
  }
}
