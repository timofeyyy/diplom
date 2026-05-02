import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-text-search',
  imports: [ReactiveFormsModule],
  templateUrl: './simple-text-search.html',
  styleUrl: './simple-text-search.css',
})
export class SimpleTextSearch {
  @Output()
  onSearchTextCnahged: EventEmitter<string> = new EventEmitter()
  @Input()
  searchControl = new FormControl('');
  change(event: any) {
    this.onSearchTextCnahged.emit(event.target.value)
  }
}
