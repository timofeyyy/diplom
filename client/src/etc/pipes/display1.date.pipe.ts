import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'sameDayDisplay'
})
export class SameDayDisplayPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: string | Date, ...args: unknown[]): string | null {
    if (!value) return null;

    const inputDate = new Date(value);
    const today = new Date();

    // Set time to 00:00:00 for accurate day comparison
    const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return this.datePipe.transform(value, 'HH:mm');
    // if (inputDay.getTime() === todayDay.getTime()) {
    //   // Same day: display only time (e.g., "9:43 AM")
    //   return this.datePipe.transform(value, 'shortTime');
    // } else {
    //   // Different day: display full date and time (e.g., "Jun 15, 2015, 9:43 PM")
    //   return this.datePipe.transform(value, 'medium');
    // }
  }
}
