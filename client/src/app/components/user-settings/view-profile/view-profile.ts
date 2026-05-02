import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { PeopleList } from "../../people-list/people-list";
import { MeService } from '../../../../service/user/me.service';
import { Subscription } from 'rxjs';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { FreindsService } from '../../../../service/user/friends.service';
import { SimpleTextSearch } from '../../simple-text-search/simple-text-search';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { DatePipe, NgStyle } from '@angular/common';
import { Avatar } from "../../avatar/avatar";

@Component({
  selector: 'app-view-profile',
  imports: [PeopleList, SimpleTextSearch, DatePipe, Avatar],
  templateUrl: './view-profile.html', 
  styleUrls: ['./view-profile.css'],
})
export class ViewProfile implements OnInit {
  constructor(
    private readonly meService: MeService,
    private readonly friendsService: FreindsService,
    private readonly settingsComm: SettingsCommunicationService,
  ) { }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }
  loader!: boolean
  me?: UserDto
  meSub?: Subscription
  originalFriends: UserDto[] = []
  displayedFriends: UserDto[] = []

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res
      const id: string = this.me!._id.toString()
      this.friendsService.listen(id).subscribe((res) => {
        if (res) {
          this.originalFriends = res
          this.displayedFriends = Array.from(this.originalFriends)
          this.loader = false
        }
        else {
          this.displayedFriends = [this.me!]
          this.loader = true
          this.friendsService.update(id)
        }
      })
    })
  }
  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }

  stateMessanger = (user: Partial<UserDto> | undefined, index: number): void => {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS, payload: {
        user: user,
        mode: user?._id == this.me?._id ? SettingsOptions.USER_VIEW : SettingsOptions.OTHER_USER_VIEW
      }
    })
  }

  search(input: string): void {
    const value = input.toLowerCase()
    if (!value) {
      this.displayedFriends = Array.from(this.originalFriends)
      return
    }
    const newDisplayedFriends = this.originalFriends.filter(friend => {
      const userName = friend.userName.toLowerCase()

      if (value.length < 4) {
        return userName.includes(value)
      }

      const inputTrigrams = this.getTrigrams(value)
      const nameTrigrams = this.getTrigrams(userName)

      const matches = this.countMatches(nameTrigrams, inputTrigrams)

      const similarity =
        (2 * matches) / (nameTrigrams.length + inputTrigrams.length)

      return similarity >= 0.3
    })
    // console.log(newDisplayedFriends)
    this.displayedFriends = Array.from(newDisplayedFriends)
  }

  private countMatches(a: string[], b: string[]): number {
    const setB = new Set(b)
    let matches = 0

    for (const gram of a) {
      if (setB.has(gram)) {
        matches++
      }
    }

    return matches
  }

  private getTrigrams(str: string): string[] {
    const normalized = str.toLowerCase()
    const trigrams: string[] = []

    for (let i = 0; i < normalized.length - 2; i++) {
      trigrams.push(normalized.slice(i, i + 3))
    }

    return trigrams
  }

  getAvatarUrl(url: string) {
    return `url("${url}")`;
  }
}
