import { Component, Input, OnInit } from '@angular/core';
import { UserDto } from '../../../../dto/user.dto';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { SettingsOptions } from '../../../../etc/enum/settings.enum';
import { FormsModule } from '@angular/forms';
import { PeopleList } from "../../people-list/people-list";
import { MeService } from '../../../../service/user/me.service';
import { lastValueFrom, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-view-profile',
  imports: [PeopleList],
  templateUrl: './view-profile.html',
  styleUrls: ['./view-profile.css'],
})
export class ViewProfile implements OnInit {
  constructor(
    private readonly comm: CommunicationService,
    private readonly meService: MeService
  ) { }

  ngOnDestroy(): void {
    this.meSub?.unsubscribe()
  }

  me?: UserDto
  meSub?: Subscription

  ngOnInit() {
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res.payload
      this.mockFriends = [this.me!]
    })

  }
  // @Input() 
  // me!: UserDto

  close() {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: false,
      payload: {}
    })
  }

  mockFriends: UserDto[] = []

  // buffPartsSplit(lengthPart: number, buffer: string[]) {
  //   const chunkedArray = []
  //   for (let i = 0; i < buffer.length; i += lengthPart) {
  //     chunkedArray.push(buffer.slice(i, i + lengthPart));
  //   }
  //   return chunkedArray
  // }

  // search(event: any): void {
  //   const value = event.target.value as string
  //   const satisfyNum = 3
  //   const newMockedFriends : UserDto[] = []
  //   this.mockFriends.forEach((friend) => {
  //     const half = Math.ceil(satisfyNum / 2)
  //     const chunkedUserName = this.buffPartsSplit(satisfyNum, friend.userName.split(''))
  //     const chunkedInput = this.buffPartsSplit(satisfyNum, value.split(''))
  //     let total = 0
  //     for (let i = 0; i < chunkedUserName.length; i++) {
  //       const userNameParts = chunkedUserName[i]
  //       const inputParts = chunkedInput[i]
  //       if (inputParts) {
  //         let satisfyPartCount = 0
  //         for (const inputChar of inputParts) {
  //           const res = userNameParts.find((char) => char.toLowerCase() === inputChar.toLowerCase())
  //           if (res) {
  //             satisfyPartCount++
  //           }
  //         }
  //         console.log(satisfyPartCount)
  //         if (satisfyPartCount >= Math.ceil(inputParts.length/2)) {
  //           total++
  //         }
  //       }
  //       else {
  //         break
  //       }
  //     }
  //     console.log(total, Math.floor(chunkedUserName.length / 2), Math.ceil(chunkedInput.length / 2))
  //     if (total >= Math.ceil(chunkedUserName.length / 2) || total >= Math.ceil(chunkedInput.length / 2)) {
  //       newMockedFriends.push(friend)
  //     }
  //   })
  //   console.log(newMockedFriends)

  // }
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
