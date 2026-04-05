import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { CommunicationService, Dispatch } from '../../../service/communication/communication.service';
import { UserSettings } from '../user-settings/user-settings';
import { SettingsHistoryService } from '../../../service/user/user.settings.history.service';

@Component({
  selector: 'app-popup-settings-options',
  imports: [UserSettings],
  providers: [SettingsHistoryService],
  templateUrl: './popup-settings-options.html',
  styleUrl: './popup-settings-options.css',
})
export class PopupSettingsOptions implements OnInit {
  constructor(
    private readonly comm: CommunicationService,
    private readonly eRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.comm.listen(SettingsOptions.USER_SETTINGS).subscribe((data: Dispatch<SettingsOptions>) => {
      console.log(data)
      this.action = data
    })

    this.comm.listen(SettingsOptions.UPDATE_USER_DATA).subscribe((data: Dispatch<SettingsOptions>) => {
      // console.log(data)
      this.action!.payload!.user! = data.payload
      console.log(this.action)
      // this.action = { ...this.action, payload: { mode: this.action?.payload.mode, }}
    })
  }

  action: Dispatch<SettingsOptions> | undefined

  get SettingsOptions() {
    return SettingsOptions
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      // this.action = undefined
    }
  }
}
