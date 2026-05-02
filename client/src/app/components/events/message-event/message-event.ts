import { Component, Input } from '@angular/core';
import { Avatar } from "../../avatar/avatar";
import { AvatarSettings } from '../../../../service/avatar/avatar.dto';

@Component({
  selector: 'app-message-event',
  imports: [Avatar],
  templateUrl: './message-event.html',
  styleUrls: ['./message-event.css', '../common/styles/common.scss'],
})
export class MessageEvent {
  @Input()
  payload!: {
    userName: string,
    message: string,
    avatar: string, 
    displayAvatarSettings: AvatarSettings
  }
}
