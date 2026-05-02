import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { PeopleList } from "../../people-list/people-list";
import { FriendStatus } from '../../../../etc/enum/friend.enum';
import { MeService } from '../../../../service/user/me.service';
import { Subscription } from 'rxjs';
import { ChatsHistoryService } from '../../../../service/user/chats.service';
import { EmitSocketMessangerEnum } from '../../../../etc/enum/socket.enum';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { SimpleTextSearch } from "../../simple-text-search/simple-text-search";
import { FreindsService } from '../../../../service/user/friends.service';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { DatePipe, NgStyle } from '@angular/common';
import { AvatarSettings } from '../../../../service/avatar/avatar.dto';
import { Avatar } from "../../avatar/avatar";
import { FriendStatusEnum } from '../../../../etc/enum/notification.enum';

@Component({
  selector: 'app-view-other-profile',
  imports: [PeopleList, SimpleTextSearch, DatePipe, Avatar],
  templateUrl: './view-other-profile.html',
  styleUrls: ['../view-profile/view-profile.scss', './view-other-profile.scss'],
})
export class ViewOtherProfile implements OnInit {
  avatarDisplaySettings!: AvatarSettings

  constructor(
    private readonly comm: CommunicationService,
    private readonly meService: MeService,
    private readonly chatsService: ChatsHistoryService,
    private readonly settingsComm: SettingsCommunicationService,
    private readonly friendsService: FreindsService,
  ) { }
  calculateFriendStatus(): FriendStatusEnum | undefined {
    console.log("calculate")
    console.log(this.me, this.opponent)
    const opponentFriendRequest = this.opponent.friendRequests.find((req) => req.receiverId == this.me?._id)
    if (opponentFriendRequest) {
      return opponentFriendRequest.status
    }
    return undefined
  }

  me?: UserDto
  chatUpdateSub?: Subscription
  originalFriends: UserDto[] = []
  displayedFriends: UserDto[] = []
  loader!: boolean

  async ngOnInit() {
    this.meService.listen().subscribe((res) => {
      this.me = res
      this.friendStatus = this.calculateFriendStatus()
    })
    const id: string = this.opponent!._id.toString()
    this.friendsService.listen(id).subscribe((res) => {
      console.log(res)
      if (res) {
        this.originalFriends = res
        this.displayedFriends = Array.from(this.originalFriends)
        this.loader = false
      }
      else {
        this.displayedFriends = [this.opponent!]
        this.loader = true
        this.friendsService.update(id)
      }
    })

    this.chatUpdateSub = this.chatsService.listen().subscribe((res) => {
      const chatsHistory: any[] = []
      res.forEach((chatItem: any) => {
        const details = chatItem.participantDetails as any[]
        details.forEach((detail) => {
          if (detail._id != this.me?._id) {
            chatsHistory.push(detail)
          }
        })
      })
      const opponentId = this.opponent?._id
      if (opponentId) {
        const newOpponent = chatsHistory.find((user) => user._id == opponentId)
        if (newOpponent) {
          this.opponent = newOpponent
        }
      }
      this.friendStatus = this.calculateFriendStatus()
      this.friendsService.update(id)
    })
  }

  stateMessanger = (user: Partial<UserDto> | undefined, index: number): void => {
    this.settingsComm.send(SettingsHistoryEnum.PUSH, {
      action: SettingsOptions.USER_SETTINGS, payload: {
        user: user,
        mode: user?._id == this.me?._id ? SettingsOptions.USER_VIEW : SettingsOptions.OTHER_USER_VIEW
      }
    })
  }
  @Input()
  opponent!: UserDto
  friendStatus?: FriendStatusEnum
  get FriendStatusEnum() {
    return FriendStatusEnum
  }
  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }

  mockFriends: UserDto[] = []

  receiverRequestRealTime(del: boolean) {
    this.comm.send(EmitSocketMessangerEnum.RECEIVER_STATUS_UPDATE, { recieverId: this.opponent._id.toString(), del: del })
  }
  senderRequestRealTime(del: boolean) {
    this.comm.send(EmitSocketMessangerEnum.SENDER_STATUS_UPDATE, { recieverId: this.opponent._id?.toString(), del: del })
  }

  search(event: any): void {
    const value = (event.target.value as string).toLowerCase()

    if (!value) return

    const newMockedFriends = this.mockFriends.filter(friend => {
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
  }

  countMatches(a: string[], b: string[]): number {
    const setB = new Set(b)
    let matches = 0

    for (const gram of a) {
      if (setB.has(gram)) {
        matches++
      }
    }

    return matches
  }
  getTrigrams(str: string): string[] {
    const normalized = str.toLowerCase()
    const trigrams: string[] = []

    for (let i = 0; i < normalized.length - 2; i++) {
      trigrams.push(normalized.slice(i, i + 3))
    }

    return trigrams
  }
}
