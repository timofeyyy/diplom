import { NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsHistoryEnum } from '../../popup-settings-options/popup-settings-options';
import { SettingsCommunicationService } from '../../../../service/communication/settings.communication.service';
import { RefreshHttpService } from '../../../../service/http/refresh.service';
import { AvatarHistoryHttpService } from '../../../../service/http/avatar-history.http.service';
import { AvatarHistoryService } from '../../../../service/avatar/avatar-history.service';
import { AvatarSettings } from '../../../../service/avatar/avatar.dto';
import { CommunicationService } from '../../../../service/communication/communication.service';
import { AppEnum } from '../../../../etc/enum/app.enum';

export const defaultAvatarSettings = {
  positionX: 0,
  positionY: 0,
  scale: .5
}

@Component({
  selector: 'app-avatar-upload',
  imports: [NgStyle, FormsModule],
  templateUrl: './avatar-upload.html',
  styleUrl: './avatar-upload.css',
})
export class AvatarUpload implements OnChanges {
  @ViewChild('photo') photo!: ElementRef;
  @Input()
  file: any
  @Input()
  editMode?: boolean

  dragging = false;
  renderenImageHeight?: number
  renderenImageWidth?: number
  originalImageWidth?: number
  originalImageHeight?: number
  containerWidth?: number
  containerHeight?: number
  running = false;
  @Input()
  uri?: string
  @Input()
  displayAvatarSettings?: AvatarSettings

  constructor(
    private readonly settingsComm: SettingsCommunicationService,
    private readonly refreshHttpService: RefreshHttpService,
    private readonly avatarHistoryHttpService: AvatarHistoryHttpService,
    private readonly avatarHistoryService: AvatarHistoryService,
    private readonly comm: CommunicationService
    // private readonly avatarDisplaySettingsService: AvatarDisplaySettingsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.displayAvatarSettings) {
      this.displayAvatarSettings = defaultAvatarSettings
    }
    if (this.file) {
      this.uri = URL.createObjectURL(this.file)
    }
    this.imagePicked()
  }


  imagePicked() {
    const img = new Image();
    img.src = this.uri!;

    img.onload = () => {
      this.originalImageWidth = img.naturalWidth;
      this.originalImageHeight = img.naturalHeight;
      const rect = this.photo.nativeElement.getBoundingClientRect();
      this.containerWidth = rect.width;
      this.containerHeight = rect.height;
      const scale = Math.max(
        this.containerWidth! / this.originalImageWidth,
        this.containerHeight! / this.originalImageHeight
      );
      this.renderenImageWidth = this.originalImageWidth * scale;
      this.renderenImageHeight = this.originalImageHeight * scale;
    };
  }

  get maxOffsetXPercent() {
    if (!this.renderenImageWidth || !this.containerWidth) return 0;

    return Math.max(
      0,
      ((this.renderenImageWidth - this.containerWidth) / this.renderenImageWidth) * 50
    );
  }

  get maxOffsetYPercent() {
    if (!this.renderenImageHeight || !this.containerHeight) return 0;

    return Math.max(
      0,
      ((this.renderenImageHeight - this.containerHeight) / this.renderenImageHeight) * 50
    );
  }

  startDrag(event: PointerEvent) {
    this.dragging = true;
  }

  stopDrag() {
    this.dragging = false;
  }

  onAvatarSelect(event: any) {
    const file = event.target.files[0];
    // console.log(file)
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Только изображения!');
      return;
    }
    this.file = file
    this.uri = URL.createObjectURL(this.file)
    this.imagePicked()
  }

  back() {
    this.settingsComm.send(SettingsHistoryEnum.POP)
  }

  close() {
    this.settingsComm.send(SettingsHistoryEnum.CLEAR)
  }

  loop = (callback: () => any) => {
    if (!this.running) return;

    callback()
    requestAnimationFrame(() => this.loop(callback));
  };

  startAction(callback: () => any) {
    this.running = true;
    this.loop(callback);
  }

  stopAction() {
    this.running = false;
  }

  moveLeft = () => {
    const max = this.maxOffsetXPercent + 20;
    this.displayAvatarSettings!.positionX = Math.max(-max, this.displayAvatarSettings!.positionX - 0.5);
  }

  moveRight = () => {
    const max = this.maxOffsetXPercent + 20;
    this.displayAvatarSettings!.positionX = Math.min(max, this.displayAvatarSettings!.positionX + 0.5);
  }

  moveUp = () => {
    const max = this.maxOffsetYPercent;
    this.displayAvatarSettings!.positionY = Math.min(max, this.displayAvatarSettings!.positionY + 0.5);
  }

  moveDown = () => {
    const max = this.maxOffsetYPercent;
    this.displayAvatarSettings!.positionY = Math.max(-max, this.displayAvatarSettings!.positionY - 0.5);
  }

  save() {
    if (this.file) {
      const formData = new FormData();
      formData.set('file', this.file)
      formData.set('displaySettings', JSON.stringify(this.displayAvatarSettings))
      this.comm.send(AppEnum.LOADER, { active: true })
      this.refreshHttpService.require(this.avatarHistoryHttpService.add(formData)).subscribe((res) => {
        this.comm.send(AppEnum.LOADER, { active: false })
        this.avatarHistoryService.update()
        this.back()
      })
    }
  }

  edit() {
    if (this.uri) {
      const buff = this.uri.split('/')
      const filename = buff[buff.length - 1]
      this.comm.send(AppEnum.LOADER, { active: true })
      this.refreshHttpService.require(this.avatarHistoryHttpService.edit({ displaySettings: this.displayAvatarSettings }, filename)).subscribe((res) => {
        this.comm.send(AppEnum.LOADER, { active: false })
        this.avatarHistoryService.update()
        this.back()
      })
    }

  }

  getAvatarUrl(url: string | undefined) {
    return `url("${url}")`;
  }
}
