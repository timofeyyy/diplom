import { Component, OnInit } from '@angular/core';
import { SocketNotificationService } from '../../../service/socket/socket.notification.service';
import { CommunicationService } from '../../../service/communication/communication.service';
import { OnSocketNotificationEnum } from '../../../etc/enum/socket.enum';
import { NotificationService } from '../../../service/user/notification.service';
import { NotificationDto } from '../../../dto/notification.dto';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css', '../user-settings/edit-profile/styles.css'],
})
export class Notifications implements OnInit {
  htmlMessage(message: string) {

  }
  constructor(
    private readonly comm: CommunicationService,
    private readonly notificationService: NotificationService
  ) { }
  notifications: NotificationDto[] = []
  ngOnInit(): void {
    this.notificationService.listen().subscribe((res) => {
      console.log(res)
      const notofications: NotificationDto[] = res.payload
      this.notifications = notofications
    })
  }

}
