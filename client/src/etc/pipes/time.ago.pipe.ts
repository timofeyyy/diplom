import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | string | number, currentDate: Date): string {
    if (!value) return '';

    const now = currentDate.getTime();
    const date = new Date(value).getTime();

    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return formatDate(value, 'dd.MM.yy HH:mm', 'en');
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      const remainingSeconds = seconds % 60;

      let result = `${hours} ч`;

      if (remainingMinutes > 0) {
        result += ` ${remainingMinutes} мин`;
      }

      // if (remainingSeconds > 0) {
      //   result += ` ${remainingSeconds} сек`;
      // }

      return result + ' назад';
    }

    if (minutes > 0) {
      const remainingSeconds = seconds % 60;

      // if (remainingSeconds > 0) {
      //   return `${minutes} мин ${remainingSeconds} сек назад`;
      // }

      return `${minutes} мин назад`;
    }

    // if (seconds > 0) {
    //   return `${seconds} сек назад`;
    // }

    return 'только что';
  }
}