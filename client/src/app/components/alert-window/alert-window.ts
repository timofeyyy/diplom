import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert-window',
  imports: [NgStyle],
  templateUrl: './alert-window.html',
  styleUrl: './alert-window.css',
})
export class AlertWindow {
  @Output()
  closeEvent: EventEmitter<void> = new EventEmitter()
  
  close() {
    this.closeEvent.emit()
  }
  @Input() header!: string
  @Input() parahraph!: string
}
