import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PeopleList } from "../components/people-list/people-list";
import { debounceTime, distinctUntilChanged, filter, switchMap, of, tap, pipe, take, Subscription, lastValueFrom } from 'rxjs';
import { UsersHttpService } from '../../service/http/users.http.service';
import { AuthHttpRequirementService } from '../../service/http/auth.http.requirements.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDto } from '../../dto/user.dto';
import { CommunicationService } from '../../service/communication/communication.service';
import { UserAction } from '../../etc/enum/auth.enum';
import { Messanger } from "./messanger/messanger";
import { EventsEnum } from '../../etc/enum/app.enum';
import { SettingsOptions } from '../../etc/enum/settings.enum';
import { MeService } from '../../service/user/me.service';
// import { MessangerHandlersService } from './messanger/messanger.service';
import { ChatsHistoryService } from '../../service/user/chats.service';
import { CommunicationBehaivorService } from '../../service/communication/communication.behaivor.service';
import { NgClass } from '@angular/common';
import { ChatListEnum } from '../../etc/enum/chat.enum';
import { ChatListDto } from '../../dto/chat.list.dto';

@Component({
  selector: 'app-friends',
  imports: [PeopleList, ReactiveFormsModule, Messanger, NgClass],
  providers: [FormsModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Friends implements OnDestroy, OnInit {

  constructor(
    private readonly usersHttp: UsersHttpService,
    private readonly httpReuirements: AuthHttpRequirementService,
    private readonly comm: CommunicationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly meService: MeService,
    private readonly chatsService: ChatsHistoryService

  ) { }
  ngOnDestroy(): void {
    this.chatUpdate?.unsubscribe()
  }

  chatListType: ChatListEnum = ChatListEnum.PEOPLE
  get ChatListEnum() {
    return ChatListEnum
  }

  searchControl = new FormControl('');
  // users: Partial<UserDto>[] = [];
  // friends: Partial<UserDto>[] = [];
  loader: boolean = true

  private cache = new Map<string, any>();

  opponent: Partial<UserDto> | undefined
  stateMessanger = (user: Partial<UserDto> | undefined, index: number): void => {
    this.opponent = user
    this.cdr.detectChanges()
  }

  chatsList: ChatListDto = {
    people: [],
    workGroups: [],
    friends: [],
    input: [],
    output: []
  }

  result: Partial<UserDto>[] = [];
  userChats: Partial<UserDto>[] = [];

  inputValue!: string
  chatUpdate?: Subscription
  me?: UserDto
  meSub?: Subscription
  async ngOnInit() {
    this.me = (await lastValueFrom(this.meService.listen().pipe(take(1)))).payload;
    this.meSub = this.meService.listen().subscribe((res) => {
      this.me = res.payload
    })
    this.chatUpdate = this.chatsService.listen().subscribe((res) => {
      this.chatsList = {
        people: [],
        workGroups: [],
        friends: [],
        input: [],
        output: []
      }
      res.payload.forEach((chatItem: any) => {
        if (chatItem.workGroup) {

        }
        else {

          const details = chatItem.participantDetails as any[]
          details.forEach((detail) => {
            if (detail._id != this.me?._id) {
              console.log(detail.duoChat)
              switch (detail.duoChat) {
                case ChatListEnum.OUTPUT: {
                  this.chatsList.output.push(detail)
                  break
                }
                case ChatListEnum.INPUT: {
                  this.chatsList.input.push(detail)
                  break
                }
                case ChatListEnum.FRIENDS: {
                  this.chatsList.friends.push(detail)
                }


                // case ChatListEnum.PEOPLE: {
                //   this.chatsList.people.push(detail)
                //   break
                // }
              }
              this.chatsList.people.push(detail)
            }
          })
        }
      })


      this.selectChats()
      // this.chatsList = chatsList
      // this.userChats = Array.from(this.chatsList)
      const opponentId = this.opponent?._id
      if (this.opponent && opponentId) {
        const newOpponent = this.userChats.find((user) => user._id == opponentId)
        if (newOpponent) {
          this.opponent = newOpponent
        }
      }
      console.log(this.opponent)
      this.loader = false
      this.cdr.detectChanges()
    })

    this.searchControl.valueChanges.pipe(
      switchMap((q) => {
        this.inputValue = q!
        if (q!.length == 0 || q!.length <= 2) {
          this.selectChats()
        }
        // else if (q!.length <= 2) {
        //   this.searchReuslts = Array.from(this.friends)
        // }
        return of(q)
      }),
      debounceTime(100),
      distinctUntilChanged(),
      filter((q): q is string => !!q && q.length >= 2),
      switchMap((q: string) => {
        if (this.cache.has(q)) {
          return of(this.cache.get(q));
        }
        this.loader = true
        return this.httpReuirements.require(this.usersHttp.search(q!)).pipe(
          tap(res => this.cache.set(q, res))
        )
      }
      )).subscribe((result: any) => {
        console.log(result)
        this.loader = false
        this.result = result;
      })
  }

  selectChats() {
    switch (this.chatListType) {
      case ChatListEnum.FRIENDS: {
        this.userChats = Array.from(this.chatsList.friends)
        break
      }
      case ChatListEnum.PEOPLE: {
        this.userChats = Array.from(this.chatsList.people)
        break
      }
      case ChatListEnum.WORK_GROUPS: {
        this.userChats = Array.from(this.chatsList.workGroups)
        break
      }
      case ChatListEnum.INPUT: {
        this.userChats = Array.from(this.chatsList.input)
        break
      }
      case ChatListEnum.OUTPUT: {
        this.userChats = Array.from(this.chatsList.output)
      }
    }
    if (!this.inputValue) {
      this.result = Array.from(this.userChats)
    }

  }
}
