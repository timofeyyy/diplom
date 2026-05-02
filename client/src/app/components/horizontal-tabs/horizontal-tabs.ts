import { NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-horizontal-tabs',
  imports: [NgStyle], 
  templateUrl: './horizontal-tabs.html',
  styleUrl: './horizontal-tabs.css',
})
export class HorizontalTabs implements AfterViewInit {

  @ViewChild('parent') parent!: ElementRef<HTMLElement>;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef<HTMLElement>;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  @Input()
  step: number = 0.5
  scrollState: boolean = false
  contentWidth!: number
 
  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    const parentWidth = this.parent.nativeElement.clientWidth;
    this.contentWidth = this.content.nativeElement.clientWidth;
    console.log(this.contentWidth, parentWidth)
    if (this.contentWidth > parentWidth) {
      this.scrollState = true
      this.cdr.detectChanges()
    }
  }
  scroll(direction: number) {
    const step = this.contentWidth * this.step;
    console.log(step * direction)
    this.contentWrapper.nativeElement.scrollBy({
      left: step * direction,
      behavior: 'smooth'
    });
  }
}
