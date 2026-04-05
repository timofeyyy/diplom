import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { FormsModule } from '@angular/forms';
import { PeopleList } from "../../people-list/people-list";
import { FriendStatus } from '../../../../etc/enum/friend.enum';
import { UsersHttpService } from '../../../../service/http/users.http.service';
import { AppEnum, EventsEnum } from '../../../../etc/enum/app.enum';
import { MeService } from '../../../../service/user/me.service';
// import { EmitMessangerEnum } from '../../../../etc/enum/messanger.enum';
import { lastValueFrom, pipe, Subscription, take, takeUntil } from 'rxjs';
import { ChatsHistoryService } from '../../../../service/user/chats.service';
import { EmitSocketMessangerEnum } from '../../../../etc/enum/socket.enum';

@Component({
  selector: 'app-view-other-profile',
  imports: [PeopleList],
  templateUrl: './view-other-profile.html',
  styleUrls: ['../view-profile/view-profile.scss', './view-other-profile.scss'],
})
export class ViewOtherProfile implements OnInit, OnChanges {
  constructor(
    private readonly comm: CommunicationService,
    private readonly UsersHttpService: UsersHttpService,
    private readonly meService: MeService,
    private readonly chatsService: ChatsHistoryService
  ) { }

  ngOnChanges(): void {
    this.mockFriends = [this.opponent]
    // if (this.me && this.me._id) {
    //   this.friendStatus = this.calculateFriendStatus()
    // }
  }

  private calculateFriendStatus(): FriendStatus {
    console.log(this.me, this.opponent)
    const myId = this.me!._id!.toString()
    const opponentId = this.opponent._id!.toString()

    const opponentRequestedMe = this.opponent.friendRequests?.includes(myId)
    const iRequestedOpponent = this.me!.friendRequests?.includes(opponentId)

    if (opponentRequestedMe && iRequestedOpponent) return FriendStatus.FREIND
    if (opponentRequestedMe) return FriendStatus.SUBSCRIBED
    if (iRequestedOpponent) return FriendStatus.DECIDE

    return FriendStatus.UNKNOWN
  }


  me?: UserDto
  chatUpdateSub?: Subscription
  async ngOnInit() {
    this.meService.listen().subscribe((res) => {
      this.me = res.payload

      this.friendStatus = this.calculateFriendStatus()
    })
    this.chatUpdateSub = this.chatsService.listen().subscribe((res) => {
      console.log("chat update profile")

      const chatsHistory: any[] = []
      res.payload.forEach((chatItem: any) => {
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
    })
  }
  @Input()
  opponent!: UserDto
  friendStatus?: FriendStatus = FriendStatus.UNKNOWN
  get FriendStatus() {
    return FriendStatus
  }
  close() {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: false,
      payload: {}
    })
  }

  mockFriends: UserDto[] = []

  receiverRequestRealTime(del: boolean) {
    this.comm.send(EmitSocketMessangerEnum.RECEIVER_STATUS_UPDATE, { active: true, payload: { recieverId: this.opponent._id.toString(), del: del } })
  }
  senderRequestRealTime(del: boolean) {
    this.comm.send(EmitSocketMessangerEnum.SENDER_STATUS_UPDATE, { active: true, payload: { recieverId: this.opponent._id?.toString(), del: del } })
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

    console.log(newMockedFriends)
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
}
