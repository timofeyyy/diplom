import { Component } from '@angular/core';
import { UserAction } from '../../../etc/enum/auth.enum';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { CreateRoom } from "../../components/create-room/create-room";

@Component({
  selector: 'app-main',
  imports: [CreateRoom],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  action: UserAction | undefined

  doAction(action: string) {
    this.action = action as UserAction
    console.log(action)
  }
  get SettingsOptions() {
    return SettingsOptions
  }
}
