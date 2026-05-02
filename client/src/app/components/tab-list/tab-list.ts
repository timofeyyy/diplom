import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Tab {
  image: string,
  command: (...args: any) => void,
  counter: number,
  name: string,
  tabKey: any
}

@Component({
  selector: 'app-tab-list',
  imports: [NgClass],
  templateUrl: './tab-list.html',
  styleUrl: './tab-list.css',
})
export class TabList {
  @Input()
  selectedTab: any
  @Input()
  tabs: Tab[] = []
  
}
