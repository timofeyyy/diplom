import { NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  imports: [NgStyle],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
})
export class ImageViewer implements OnInit, AfterViewInit {

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    // this.contentWidth = this.image.nativeElement.clientWidth

  }
  @ViewChild('image') image!: ElementRef<HTMLElement>;
  currentImage?: string
  contentWidth!: number
  contentHeight!: number
  ngOnInit(): void {
    this.currentImage = this.urls![this.currentIndex!]
    const img = new Image();
    img.src = this.currentImage;
    img.onload = () => {
      this.contentWidth = img.naturalWidth;
      this.contentHeight = img.naturalHeight;
    };
    this.cdr.detectChanges()
  }
  prev() {
    if (this.currentIndex != 0) {
      this.currentIndex!--
      this.currentImage = this.urls![this.currentIndex!]
    }
    // console.log(this.currentIndex)
    // console.log(this.urls)
  }
  next() {
    if (this.urls!.length - 1 != this.currentIndex) {
      this.currentIndex!++
      this.currentImage = this.urls![this.currentIndex!]
    }
    // console.log(this.currentIndex)
  }
  @Input()
  currentIndex?: number
  @Input()
  urls?: string[]
  @Output()
  close: EventEmitter<void> = new EventEmitter()
}
