import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ɵEmptyOutletComponent } from "@angular/router";

@Component({
  selector: 'app-custom-event',
  imports: [NgClass],
  templateUrl: './custom-event.html',
  styleUrl: './custom-event.css',
})
export class CustomEvent implements OnInit {
  hide!: boolean
  @Input()
  index!: number
  @Output()
  close: EventEmitter<number> = new EventEmitter<number>()

  ngOnInit(): void {
    setTimeout(() => this.closeHandle(), 7000);
  }

  closeHandle() {
    this.hide = true
    setTimeout(() => {
      this.close.emit(this.index)
    }, 300);
  }
}
