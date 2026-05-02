import { inject, Pipe, PipeTransform } from '@angular/core';
import { StatusStorageObjService } from '../../service/communication/status.storage.service';
import { map } from 'rxjs';
import { DatePipe } from '@angular/common';
import { UserDto } from '../../dto/user.dto';
import { UserStatus } from '../enum/app.enum';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'displayStatus',
    standalone: true,
})
export class DisplayStatusPipe implements PipeTransform {

    private statusStorageObjService = inject(StatusStorageObjService);
    private datePipe = inject(DatePipe);
    private sanitizer = inject(DomSanitizer);

    transform(user: Partial<UserDto>) {
        return this.statusStorageObjService.listen()
            .pipe(
                map(res => {
                    const record = res[user._id!];
                    if (record?.online) {
                        const html = `<span style="color:#8888dc;font-weight: 400;">${UserStatus.ONLINE}</span>`;
                        return this.sanitizer.bypassSecurityTrustHtml(html);
                    }

                    if (user.status?.show && record?.date) {
                        return `был(а) ${this.formatSpecificDate(record.date)}`;
                    }

                    return "был(а) недавно";
                })
            )
    }

    formatSpecificDate(dateInput: Date | string | number): string {
        const date = new Date(dateInput);
        const now = new Date();

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (target.getTime() === today.getTime()) {
            return `в ${this.datePipe.transform(date, 'HH:mm')}`;
        }

        if (target.getTime() === yesterday.getTime()) {
            return `в вчера ${this.datePipe.transform(date, 'HH:mm')}`;
        }

        return this.datePipe.transform(date, 'dd.MM.yyyy') || '';
    }
}
