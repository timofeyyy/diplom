import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { CommunicationService } from '../../../service/communication/communication.service';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { FormsModule } from '@angular/forms';
import { ViewProfile } from "./view-profile/view-profile";
import { EditProfile } from "./edit-profile/edit-profile";
import { SettingsHistoryService } from '../../../service/user/user.settings.history.service';
import { ViewOtherProfile } from './view-other-profile/view-other-profile';
 
@Component({
  selector: 'app-user-settings',
  imports: [FormsModule, ViewProfile, EditProfile, ViewOtherProfile],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.css',
})
export class UserSettings implements OnInit {
  @ViewChild("window", { static: false })
  window: ElementRef | undefined;
  constructor(
    private readonly comm: CommunicationService,
    private readonly history: SettingsHistoryService,
    private readonly eRef: ElementRef

  ) { }
  ngOnInit(): void {
    this.history.clear()
    this.history.push(this.state)
  }

  @Input()
  user!: UserDto
  @Input()
  state!: SettingsOptions

  close() {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: false,
      payload: {}
    })
  }
  back() {
    this.history.pop()
    this.state = this.history.getLast()!
  }

  get History() {
    return this.history
  }

  openNewWindow(state: SettingsOptions) {
    this.history.push(state)
    this.state = state
  }

  get SettingsOptions() {
    return SettingsOptions
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;

    const clickedInsideNotification = target.closest('.notification');
    console.log(clickedInsideNotification)
    if (
      this.window &&
      !this.window.nativeElement.contains(target) &&
      !clickedInsideNotification
    ) {
      console.log("in");
      this.close();
    }
  }
}
