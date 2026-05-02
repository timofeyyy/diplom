import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificationCounters, NotificationService, NotificationTypesList } from '../../../../service/user/notification.service';
import { NotificationDto } from '../../../../dto/notification.dto';
import { NotificationMainTypes, NotificationTypes } from '../../../../etc/enum/notification.enum';
import { NgClass } from '@angular/common';
import { NotificationEvent } from "../notification-main-types/notification-event/notification-event";
import { NotificationRequest } from "../notification-main-types/notification-request/notification-request";
import { HorizontalTabs } from "../../horizontal-tabs/horizontal-tabs";
import { Tab, TabList } from "../../tab-list/tab-list";
import { AppEnum } from '../../../../etc/enum/app.enum';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { NotificationCounterService } from '../service/notification-counter.service';

@Component({
  selector: 'app-notifications',
  imports: [NotificationEvent, HorizontalTabs, TabList, NotificationRequest],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css', '../../user-settings/edit-profile/styles.css'],
})
export class Notifications implements OnInit {

  events: NotificationDto[] = []
  requests: NotificationDto[] = []
  mentions: NotificationDto[] = []
  selectedTab: NotificationMainTypes = NotificationMainTypes.EVENTS
  tabs: Tab[] = [
    {
      name: 'Запросы',
      tabKey: NotificationMainTypes.REQUESTS,
      image: '/assets/images/user.svg',
      command: (...args) => { this.selectedTab = NotificationMainTypes.REQUESTS },
      counter: this.requests.length
    },
    {
      name: 'Упоменания',
      tabKey: NotificationMainTypes.MENTIONS,
      image: '/assets/images/user.svg',
      command: (...args) => { this.selectedTab = NotificationMainTypes.MENTIONS },
      counter: this.mentions.length
    },
    {
      name: 'События',
      tabKey: NotificationMainTypes.EVENTS,
      image: '/assets/images/user.svg',
      command: (...args) => { this.selectedTab = NotificationMainTypes.EVENTS },
      counter: this.events.length
    },
  ]

  constructor(
    private readonly comm: CommunicationService,
    private readonly notificationService: NotificationService,
    private readonly notificationCounterService: NotificationCounterService
  ) { }

  get NotificationTypes() {
    return NotificationTypes
  }

  get NotificationMainTypes() {
    return NotificationMainTypes
  }

  ngOnInit(): void {
    this.notificationService.listen().subscribe((res: NotificationTypesList) => {
      this.events = res[NotificationMainTypes.EVENTS]
      this.requests = res[NotificationMainTypes.REQUESTS]
      this.mentions = res[NotificationMainTypes.MENTIONS]
    })
    this.notificationCounterService.listen().subscribe((res: NotificationCounters) => {
      if (res) {
        this.tabs[0].counter = res[NotificationMainTypes.REQUESTS]
        this.tabs[1].counter = res[NotificationMainTypes.MENTIONS]
        this.tabs[2].counter = res[NotificationMainTypes.EVENTS]
      }
    })
  }

  close() {
    this.comm.send(AppEnum.OPEN_NOTIFICATIONS, { active: false })
  }
}

