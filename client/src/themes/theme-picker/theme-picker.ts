import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../theme.service';
import { Theme } from '../theme.dto';
import { CdkDrag, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { CommunicationService } from '../../service/communication/communication.service';
import { ConfirmationEnum } from '../../etc/enum/confirmation';
import { AppEnum } from '../../etc/enum/app.enum';
import { FormsModule } from '@angular/forms';
import { CustomOnOffSwitcher } from "../../app/components/custom-on-off-switcher/custom-on-off-switcher";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [FormsModule, CustomOnOffSwitcher, NgClass],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker implements OnInit {
  @ViewChild("window", { static: false })
  window: ElementRef | undefined;
  onSwitchStateChanged(state: boolean) {
    this.selectedMainTheme = (state ? 'light' : 'dark')
    this.applyStyls(this.selectedMainTheme!, this.selectedAppTheme!)
  }

  applyStyls(mainTheme: 'light' | 'dark', appTheme: Theme) {
    this.themeService.applyTheme(appTheme);
    this.themeService.applyMainTheme(mainTheme, appTheme);
    this.themeService.applyBorderTheme(mainTheme, appTheme)
    this.themeService.applyMiddleTheme(mainTheme, appTheme)
    this.themeService.applyGradientTheme(mainTheme, appTheme)
  }


  constructor(
    private readonly themeService: ThemeService,
    private readonly comm: CommunicationService,
    private readonly eRef: ElementRef
  ) { }

  themes: Theme[] = []

  savedAppTheme?: Theme
  selectedAppTheme?: Theme

  savedMainTheme?: 'light' | 'dark'
  selectedMainTheme?: 'light' | 'dark'

  ngOnInit(): void {
    this.themes = this.themeService.themes;

    const savedMainTheme = localStorage.getItem('mainTheme') as 'light' | 'dark';
    const saved = localStorage.getItem('theme');

    this.savedMainTheme = savedMainTheme || 'light';
    this.savedAppTheme = this.themes.find(t => t.name === saved) || this.themes.find(t => t.name === 'blue-modern');

    this.selectedAppTheme = this.savedAppTheme
    this.selectedMainTheme = this.savedMainTheme

    this.comm.listen(`${this.confirmationAction}:response`).subscribe((res) => {
      const state = res.state;
      if (state && this.selectedAppTheme) {
        this.savedAppTheme = this.selectedAppTheme
        localStorage.setItem('theme', this.selectedAppTheme.name);
      }
      if (state && this.selectedMainTheme) {
        this.savedMainTheme = this.selectedMainTheme
        localStorage.setItem('mainTheme', this.selectedMainTheme);
      }
      if (state) {
        this.close()
      }
    });
    this.applyStyls(this.savedMainTheme!, this.savedAppTheme!)
  }
  close() {
    this.applyStyls(this.savedMainTheme!, this.savedAppTheme!)
    this.comm.send(AppEnum.OPEN_THEMES, { state: false })
  }

  confirmationAction: string = "confirmationAction"
  select(theme: Theme) {
    this.selectedAppTheme = theme
    this.applyStyls(this.selectedMainTheme!, this.selectedAppTheme!)
  }

  apply() {
    this.comm.send(ConfirmationEnum.OPEN, { action: this.confirmationAction, confirmMessage: 'Применить изменения по выбранной теме?' })
  }

  getColors(theme: Theme): string[] {
    return Object.values(theme.colors);
  }
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;

    const clickedInsideNotification = target.closest('.notification');
    if (
      this.window &&
      !this.window.nativeElement.contains(target) &&
      !clickedInsideNotification
    ) {
      this.close();
    }
  }
}
