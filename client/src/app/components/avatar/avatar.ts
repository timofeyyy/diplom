import { Component, Input } from '@angular/core';
import { AvatarSettings } from '../../../service/avatar/avatar.dto';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  @Input()
  avatar!: string
  @Input()
  options?: AvatarSettings 
  @Input()
  borderRadius!: number
  @Input() 
  size!: string
  getAvatarUrl(url: string) {
    return `url("${url}")`;
  }
} 
