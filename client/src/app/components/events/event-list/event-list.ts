import { Component, Input, OnInit } from '@angular/core';
import { EventDto } from '../../../../dto/event.dto';
import { NgComponentOutlet } from '@angular/common';
import { CustomEvent } from '../custom-event/custom-event';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { AppEnum } from '../../../../etc/enum/app.enum';
import { MessageEvent } from '../message-event/message-event';
import { defaultAvatarSettings } from '../../attachments/avatar-upload/avatar-upload';

@Component({
  selector: 'app-event-list',
  imports: [NgComponentOutlet, CustomEvent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {

  events: EventDto[] = [
    {
      template: MessageEvent,
      payload: {
        userName: "whitebird",
        message: "Привет",
        avatar: "https://png.pngtree.com/thumb_back/fh260/background/20230610/pngtree-picture-of-a-blue-bird-on-a-black-background-image_2937385.jpg",
        displayAvatarSettings: defaultAvatarSettings
      }
    }
  ]

  constructor(
    private readonly comm: CommunicationService
  ) { }

  ngOnInit(): void {
    this.comm.listen(AppEnum.NOTIFICATION).subscribe((res: EventDto) => {
      this.events.push(res)
    })
  }

  close(index: any) {
    this.events.splice(index, 1);
  }
}
