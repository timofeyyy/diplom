import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navigator',
  imports: [NgClass],
  templateUrl: './navigator.html',
  styleUrl: './navigator.css',
})
export class Navigator {
  @Input()
  collapse: boolean = true
}
