import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-on-off-switcher',
  imports: [FormsModule],
  templateUrl: './custom-on-off-switcher.html',
  styleUrl: './custom-on-off-switcher.scss',
})
export class CustomOnOffSwitcher {

  @Input()
  value: boolean = false
  @Output()
  onStateChnged: EventEmitter<boolean> = new EventEmitter<boolean>()
  onCheckChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.onStateChnged.emit(!isChecked)
  }
}
