import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentsDisplayer } from "../attachments-displayer/attachments-displayer";
import { AttachmentsService } from '../../../../service/user/attachments.service';
import { AttachmentCloudDto, AttachmentLocalDto } from '../../../../dto/attachment.dto';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { AppEnum } from '../../../../etc/enum/app.enum';
import { MessangerEnum } from '../../../../etc/enum/messanger.enum';
import { AttahcmentsEnum } from '../../../../etc/enum/attahcment.enum';

@Component({
  selector: 'app-attachments-popup',
  imports: [AttachmentsDisplayer, NgClass, FormsModule],
  templateUrl: './attachments-popup.html',
  styleUrls: ['./attachments-popup.css', '../../user-settings/edit-profile/styles.css', '../../../../styles/form/form.css']
})
export class AttachmentsPopup implements OnInit {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly comm: CommunicationService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  focus!: boolean
  @Input()
  isLocal: boolean = true
  attahcments: AttachmentLocalDto[] | AttachmentCloudDto[] = []
  message?: string
  displayedAttachments: AttachmentCloudDto[] = []

  ngOnInit(): void {
    this.attachmentsService.listen().subscribe((res) => {
      this.message = res.message
      if (res.attachments.length) {
        this.attahcments = res.attachments
        if (this.isLocal) {
          this.displayedAttachments = this.localToDisaply(this.attahcments as AttachmentLocalDto[])
        }
        else {
          this.displayedAttachments = this.attahcments as AttachmentCloudDto[]
        }
      }
    })
  }
  localToDisaply(files: AttachmentLocalDto[]): AttachmentCloudDto[] {
    return files.map(f => ({
      type: f.type,
      uri: URL.createObjectURL(f.blob)
    }));
  };


  close() {
    this.attachmentsService.setAttachmentsSource([])
    this.attachmentsService.message = ""
    this.comm.send(AppEnum.OPEN_ATTACHMENTS, {active: false})
  }

  add() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (event: any) => {
      this.onImageSelect(event)
    };

    input.click();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      alert('Картинки сюда нельзя');
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Максимум 5MB');
      return
    }

    const exists = this.attahcments.some((f: any) => f.blob.name === file.name);
    if (exists) {
      alert('Такой файл уже добавлен');
      return
    }
    this.attahcments = [
      ...this.attahcments,
      { blob: file, type: AttahcmentsEnum.FILE }
    ] as any

    this.displayedAttachments = this.attahcments.map(att => ({
      type: att.type,
      uri: 'blob' in att ? URL.createObjectURL(att.blob) : att.uri
    }))

    // this.attahcments.push({ blob: file, type: AttahcmentsEnum.FILE } as any);
    this.displayedAttachments.push({ uri: URL.createObjectURL(file), type: AttahcmentsEnum.FILE } as any)
    this.cdr.detectChanges()
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения!');
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Максимум 5MB');
      return
    }

    const exists = this.attahcments.some((f: any) => f.blob.name === file.name);
    if (exists) {
      alert('Такое изображение уже добавлено');
      return
    }

    this.attahcments = [
      ...this.attahcments,
      { blob: file, type: AttahcmentsEnum.IMAGE }
    ] as any
    this.displayedAttachments = this.attahcments.map(att => ({
      type: att.type,
      uri: 'blob' in att ? URL.createObjectURL(att.blob) : att.uri
    }));

    this.attachmentsService.pushAttahcment({ blob: file, type: AttahcmentsEnum.IMAGE })
    this.cdr.detectChanges()
  }

  save() {
    this.comm.send(MessangerEnum.MESSAGE_SEND, { message: this.message, attachments: this.attahcments })
    this.close()
  }

}
