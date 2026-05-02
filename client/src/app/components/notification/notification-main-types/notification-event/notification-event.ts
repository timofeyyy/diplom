import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NotificationMainTypes, NotificationTypes } from '../../../../../etc/enum/notification.enum';
import { NotificationDto } from '../../../../../dto/notification.dto';
import { PasswordChangedNotification } from "../../notification-types/password-changed-notification/password-changed-notification";
import { UsernameChangedNotification } from "../../notification-types/username-changed-notification/username-changed-notification";
import { AvatarChangedNotification } from "../../notification-types/avatar-changed-notification/avatar-changed-notification";
import { NotificationCounterService } from '../../service/notification-counter.service';

@Component({
  selector: 'app-notification-event',
  imports: [PasswordChangedNotification, UsernameChangedNotification, AvatarChangedNotification],
  templateUrl: './notification-event.html',
})
export class NotificationEvent implements OnInit {

  @Input()
  notifications: NotificationDto[] = []

  constructor(
    private readonly notificationCounterService: NotificationCounterService
  ) { }
  
  get NotificationTypes() {
    return NotificationTypes
  }

  ngOnInit(): void {
    this.notificationCounterService.markAsReaded(NotificationMainTypes.EVENTS, this.notifications)
  }
}
