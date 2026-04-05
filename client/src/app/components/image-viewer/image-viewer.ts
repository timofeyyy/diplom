import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  imports: [NgStyle],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
})
export class ImageViewer implements OnInit {
  currentImage?: string

  ngOnInit(): void {
    console.log(this.currentIndex)
    console.log(this.urls)
    this.currentImage = this.urls![this.currentIndex!]
  }
  prev() {
    if (this.currentIndex != 0) {
      this.currentIndex!--
      this.currentImage = this.urls![this.currentIndex!]
    }
    console.log(this.currentIndex)
    console.log(this.urls)
  }
  next() {
    if (this.urls!.length - 1 != this.currentIndex) {
      this.currentIndex!++
      this.currentImage = this.urls![this.currentIndex!]
    }
    console.log(this.currentIndex)
  }
  @Input()
  currentIndex?: number
  @Input()
  urls?: string[]
  @Output()
  close: EventEmitter<void> = new EventEmitter()
}
