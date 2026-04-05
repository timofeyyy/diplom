import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { CommunicationService } from '../../../service/communication/communication.service';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { DisplayStatusPipe } from '../../../etc/pipes/display.status.pipe';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-people-list',
  imports: [DisplayStatusPipe, AsyncPipe],
  providers: [DisplayStatusPipe],
  templateUrl: './people-list.html', 
  styleUrl: './people-list.css', 
})  
export class PeopleList implements OnChanges {
  execCommand(user: Partial<UserDto>, index: number) {
    if(this.command) {
      this.command(user, index)
    }
  }
 
  constructor(
    private readonly comm: CommunicationService,
    private readonly displayStatus: DisplayStatusPipe
  ) { }
  @Input()
  command: ((user: Partial<UserDto>, index: number) => void) | undefined
  openSettings(user: Partial<UserDto>) {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: true, payload: {
        user: user,
        mode: SettingsOptions.OTHER_USER_VIEW
      }
    })
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.currentList)
  }
  @Input()
  loader: boolean = false

  @Input()
  currentList: Partial<UserDto>[] | undefined = []
}
