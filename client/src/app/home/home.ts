import { Component, OnInit } from '@angular/core';
import { Navigator } from "../navigator/navigator";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Navigator, NgClass],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  collapse: boolean = true

  ngOnInit(): void {
    console.log(document.cookie)
  }

}
