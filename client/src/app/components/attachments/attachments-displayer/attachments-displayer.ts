import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { AppEnum } from '../../../../etc/enum/app.enum';
import { AttahcmentsEnum } from '../../../../etc/enum/attahcment.enum';
import { NgClass, NgStyle } from '@angular/common';
import { AttachmentCloudDto } from '../../../../dto/attachment.dto';
import { AttachmentsService } from '../../../../service/user/attachments.service';

@Component({
  selector: 'app-attachments-displayer',
  imports: [NgClass, NgStyle],
  templateUrl: './attachments-displayer.html',
  styleUrl: './attachments-displayer.css',
})
export class AttachmentsDisplayer implements OnChanges {
  @Input()
  deleteOption: boolean = false
  constructor(
    private readonly comm: CommunicationService,
    private readonly attachmentsService: AttachmentsService,
    private readonly cdr: ChangeDetectorRef
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.files = this.attahcments.filter((attahcment) => attahcment.type == AttahcmentsEnum.FILE).map((attachment) => attachment.uri)
    this.images = this.attahcments.filter((attahcment) => attahcment.type == AttahcmentsEnum.IMAGE).map((attachment) => attachment.uri)
  }

  @Input()
  attahcments: AttachmentCloudDto[] = []

  files: string[] = []
  images: string[] = []

  remove(index: number) {
    this.attachmentsService.removeAttachment(index)
    this.attachmentsService.send()
    if (!this.attachmentsService.data.length) {
      this.comm.send(AppEnum.OPEN_ATTACHMENTS, {active: false})
    }

  }

  getFileName(url: string): string {
    // console.log(url)
    return url.split('/').pop() || 'file';
  }

  openFile(url: string) {
    window.open(url, '_blank');
  }

  viewImage(index: number, images: string[]) {
    this.comm.send(AppEnum.OPEN_IMAGE, { openIndex: index, urls: images })
  }

  getImageClass(length: number): any {
    if (length == 1) {
      return { "solo": true }
    }
    if (length == 2) {
      return { "duo": true }
    }
    if (length >= 2) {
      if (length % 2) {
        return { "multiple-double-col": true, "multiple": true }
      }
      else {
        return { "multiple-tripple-col": true, "multiple": true }
      }
    }
  }
}
