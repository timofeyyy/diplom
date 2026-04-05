import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-custom-on-off-switcher',
  imports: [],
  templateUrl: './custom-on-off-switcher.html',
  styleUrl: './custom-on-off-switcher.scss',
})
export class CustomOnOffSwitcher {

  @Output()
  onStateChnged: EventEmitter<boolean> = new EventEmitter<boolean>()
  onCheckChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.onStateChnged.emit(!isChecked)
  }
}
