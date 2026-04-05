import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UserDto } from '../../../dto/user.dto';
import { CommunicationService, Dispatch } from '../../../service/communication/communication.service';
import { SettingsOptions } from '../../../etc/enum/settings.enum';
import { AsyncPipe, DatePipe, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisplayStatusPipe } from '../../../etc/pipes/display.status.pipe';

import { AuthHttpRequirementService } from '../../../service/http/auth.http.requirements.service';
import { UsersHttpService } from '../../../service/http/users.http.service';
import { BehaviorSubject, lastValueFrom, Observable, ReplaySubject, Subject, Subscription, take, takeUntil } from 'rxjs';
import { StatusStorageEnum, StatusStorageObjService } from '../../../service/communication/status.storage.service';
import { AppEnum, EventsEnum } from '../../../etc/enum/app.enum';
import { MeService } from '../../../service/user/me.service';
import { SameDayDisplayPipe } from '../../../etc/pipes/display.time.pipe';
import { MessageDto } from '../../../dto/message.dto';
import { SocketUserService } from '../../../service/socket/socket.user.service';
import { EmitSocketMessangerEnum, NotificationTypes, OnSocketMessangerEnum } from '../../../etc/enum/socket.enum';
import { SocketNotificationService } from '../../../service/socket/socket.notification.service';
import { NotificationService } from '../../../service/user/notification.service';
import { AttachmentsDisplayer } from "../../components/attachments/attachments-displayer/attachments-displayer";
import { AttachmentCloudDto, AttachmentLocalDto } from '../../../dto/attachment.dto';
import { AttahcmentsEnum } from '../../../etc/enum/attahcment.enum';
import { MessangerEnum } from '../../../etc/enum/messanger.enum';
import { AttachmentsService } from '../../../service/user/attachments.service';

@Component({
  selector: 'app-messanger',
  imports: [NgClass, FormsModule, DisplayStatusPipe, AsyncPipe, NgStyle, DatePipe, AttachmentsDisplayer],
  providers: [DisplayStatusPipe],
  templateUrl: './messanger.html',
  styleUrl: './messanger.css',
})
export class Messanger implements OnInit, OnDestroy {
  constructor(
    private readonly comm: CommunicationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly socketMessanger: SocketUserService,
    private readonly httpRequirements: AuthHttpRequirementService,
    private readonly userHttp: UsersHttpService,
    private readonly meService: MeService,
    private readonly socketNotificationService: SocketNotificationService,
    private readonly notificationService: NotificationService,
    private readonly attachmentsService: AttachmentsService,
  ) { }

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  chatSubject: Subject<string> = new Subject()

  ngOnDestroy(): void {
    this.messagesRecieveHandler?.unsubscribe();
    this.freindRequestAction?.unsubscribe()
    this.declineAction?.unsubscribe()
    this.chatJoinedHandler?.unsubscribe()
    this.loadMessagesHandler?.unsubscribe()
  }
  chatId!: string

  messagesRecieveHandler?: Subscription
  freindRequestHandler?: Subscription
  chatJoinedHandler?: Subscription
  acceptOrDeclineHandler?: Subscription
  loadMessagesHandler?: Subscription

  freindRequestAction?: Subscription
  declineAction?: Subscription

  me?: UserDto
  mapper = new Map<string, {
    messages: MessageDto[],
    date: Date
  }>();
  messagesHistory: [string, { messages: MessageDto[], date: Date }][] = []

  appendMessage(body: MessageDto) {
    const today = new Date()
    const dateId = `${today.getMonth()} ${today.getDate()}`
    let messages = this.mapper.get(dateId)
    if (!messages) {
      messages = { messages: [], date: new Date(body.createdAt) }
      this.mapper.set(dateId, messages)
    }
    messages.messages.push(body)
    this.mapper.set(dateId, messages)
    this.messagesHistory = Object.entries(Object.fromEntries(this.mapper))
  }

  async ngOnInit() {


    this.me = (await lastValueFrom(this.meService.listen().pipe(take(1)))).payload;
    this.loadMessagesHandler = this.comm.listen(OnSocketMessangerEnum.LOAD_MESSAGES)
      .subscribe((messages) => {
        console.log("loadMessagesHandler", messages)
        if (this.chatId) {
          console.log(`${messages} load messages `);
          (messages.payload as MessageDto[]).forEach((item) => {
            console.log(item.createdAt)
            const currentDate = new Date(item.createdAt)
            const dateId = `${currentDate.getMonth()} ${currentDate.getDate()}`
            let messages = this.mapper.get(dateId)
            if (!messages) {
              messages = { messages: [], date: currentDate }
              this.mapper.set(dateId, messages)
            }
            messages.messages.push(item)
          })
          this.messagesHistory = Object.entries(Object.fromEntries(this.mapper))
          console.log(this.messagesHistory)
          this.cdr.detectChanges()
          this.scrollToBottom();
        }
      })
    this.messagesRecieveHandler = this.comm.listen(OnSocketMessangerEnum.MESSAGE_RECIEVE).subscribe((res) => {
      console.log("messagesRecieveHandler", res, this.chatId)
      if (this.chatId) {
        this.appendMessage({ chatId: this.chatId, ...res.payload })
        this.cdr.detectChanges()
        this.scrollToBottom();
      }
    })


    this.chatJoinedHandler = this.comm.listen(OnSocketMessangerEnum.CHAT_JOINED)
      .subscribe((chatId) => {
        console.log(`${chatId} chatJoinedHandler`)
        this.chatId = chatId.payload
        this.comm.send(AppEnum.LOADER, { active: false, payload: {} })
        this.socketMessanger.emitLoadMessage(chatId.payload)
      })

    this.freindRequestAction = this.comm.listen(EmitSocketMessangerEnum.RECEIVER_STATUS_UPDATE).subscribe((res) => {
      const payload = res.payload as { recieverId: string, del: boolean }
      console.log("freindRequestAction")
      if (this.chatId) {
        this.socketMessanger.emitFriendRequests(this.chatId, payload.recieverId, payload.del)
        this.socketNotificationService.emitNotificationSend({ recieverId: this.user._id?.toString(), notificationType: NotificationTypes.FRIEND_REQUEST_SENDED, data: { avatar: this.me?.avatar, userName: this.me?.userName } })
      }
    })
    this.declineAction = this.comm.listen(EmitSocketMessangerEnum.SENDER_STATUS_UPDATE).subscribe((res) => {
      const payload = res.payload as { recieverId: string, del: boolean }
      console.log("declineAction")
      if (this.chatId) {
        this.socketMessanger.emitAcceptOrDecline(this.chatId, payload.recieverId, payload.del)
        this.socketNotificationService.emitNotificationSend({ recieverId: this.user._id?.toString(), notificationType: NotificationTypes.FRIEND_REQUEST_CANCELED, data: { avatar: this.me?.avatar, userName: this.me?.userName } })
      }
    })
    this.comm.listen(MessangerEnum.MESSAGE_SEND).subscribe((res) => {
      this.input = res.payload.message
      this.files = res.payload.attachments
      console.log(this.input)
      this.sendMessage()
    })

    this.comm.send(AppEnum.LOADER, { active: true, payload: {} })
    console.log(this.user._id, this.socketMessanger.isConnected)
    this.socketMessanger.emitJoinChat(this.user._id!)

  }
  files: AttachmentLocalDto[] = [];

  viewImage(index: number, images: string[]) {
    console.log(images)
    this.comm.send(AppEnum.OPEN_IMAGE, { active: true, payload: { openIndex: index, urls: images } })
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      alert('Картинки сюда нельзя');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Максимум 5MB');
      return;
    }

    const exists = this.files.some(f => f.blob.name === file.name);
    if (exists) {
      alert('Такой файл уже добавлен');
      return;
    }

    this.files.push({ blob: file, type: AttahcmentsEnum.FILE });
    this.attachmentsService.setAttachmentsSource(this.files)
    this.attachmentsService.message = this.input
    this.attachmentsService.send()
    this.comm.send(AppEnum.OPEN_ATTACHMENTS, { active: true, payload: { message: this.input, attachments: this.files } })

    console.log('file ok', file);
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Максимум 5MB');
      return;
    }

    const exists = this.files.some(f => f.blob.name === file.name);
    if (exists) {
      alert('Такое изображение уже добавлено');
      return;
    }

    this.files.push({ blob: file, type: AttahcmentsEnum.IMAGE });
    this.attachmentsService.setAttachmentsSource(this.files)
    this.attachmentsService.message = this.input
    this.attachmentsService.send()
    this.comm.send(AppEnum.OPEN_ATTACHMENTS, { active: true, payload: { } })

    console.log('image ok', file);
  }

  getFileUrl(file: File) {
    return URL.createObjectURL(file);
  }


  sendMessage() {
    if (this.chatId && (this.input || this.files.length)) {
      const formData = new FormData();
      formData.set('chatId', this.chatId)
      if (this.input) {
        formData.set('message', this.input)
      }
      this.files.forEach(file => {
        formData.append('files', file.blob);
        formData.append('types', `${file.type}`);
      });
      this.httpRequirements.require(this.userHttp.sendMessage(formData)).subscribe((res) => {
        if ("error" in res) {

        }
        else {
          this.socketMessanger.emitSendMessage(res)
          this.socketNotificationService.emitNotificationSend({ recieverId: this.user._id?.toString(), notificationType: NotificationTypes.UNREAD_MESSAGES, data: { avatar: this.me?.avatar, userName: this.me?.userName } })
        }
        console.log(res)
      })
      console.log(this.input)
      this.input = ""
      this.files = []
    }
  }

  @ViewChild('attachWrapper') attachWrapper!: ElementRef;
  toggleAttach(event: MouseEvent) {
    event.stopPropagation();
    this.attachState = !this.attachState;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.attachWrapper.nativeElement.contains(event.target)) {
      this.attachState = false;
    }
  }

  input!: string
  openSettings() {
    this.comm.send(SettingsOptions.USER_SETTINGS, {
      active: true, payload: {
        user: this.user,
        mode: SettingsOptions.OTHER_USER_VIEW
      }
    })
  }
  // messages: MessageDto[] = []
  attachState: boolean = false
  @Input()
  user!: Partial<UserDto>
  @Output()
  close: EventEmitter<void> = new EventEmitter()



}
