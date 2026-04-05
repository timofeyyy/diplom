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
                    console.log(res)
                    const html = `<span style="color:#8888dc;font-weight: 400;">${UserStatus.ONLINE}</span>`
                    // if ((res as Set<string>).has(user._id!)) {
                    //     return this.sanitizer.bypassSecurityTrustHtml(html);
                    // }
                    const record = res[user._id!]
                    if (record?.online) {
                        return this.sanitizer.bypassSecurityTrustHtml(html);
                    }
                    else if (user.duoChat) {
                        // if (user.status?.online) {
                        //     return this.sanitizer.bypassSecurityTrustHtml(html);
                        // }
                        // else {
                        if (record?.online != undefined && user.status?.show && record?.date) {
                            return this.formatSpecificDate(record.date)
                        }
                        else {
                            return "был(а) в сети недавно"
                        }
                        // }
                    }
                    else {
                        return "был(а) в сети недавно"
                    }
                })
            )
    }
    formatSpecificDate(date: Date): string | null {
        const isToday = new Date().toDateString() === new Date(date).toDateString();
        const format = isToday ? 'HH:mm' : 'MM.dd.yyyy HH:mm';
        return this.datePipe.transform(date, format);
    }

}
// export class DisplayStatusPipe implements PipeTransform {

//     private statusStorageService = inject(StatusStorageService);
//     private datePipe = inject(DatePipe);
//     private sanitizer = inject(DomSanitizer);

//     transform(user: Partial<UserDto>) {
//         return this.statusStorageService.listen()
//             .pipe(
//                 map(res => {
//                     // console.log("display\n\n\n")
//                     // console.log(res)
//                     const html = `<span style="color:#8888dc;font-weight: 400;">${UserStatus.ONLINE}</span>`
//                     if ((res as Set<string>).has(user._id!)) {
//                         return this.sanitizer.bypassSecurityTrustHtml(html);
//                     }
//                     else if (user.isRelative) {
//                         // if (user.status?.online) {
//                         //     return this.sanitizer.bypassSecurityTrustHtml(html);
//                         // }
//                         // else {
//                         if (user.status?.show && user.status?.lastTime!) {
//                             return this.formatSpecificDate(user.status?.lastTime!)
//                         }
//                         else {
//                             return "recently-seen"
//                         }
//                         // }
//                     }
//                     else {
//                         return ""
//                     }
//                 })
//             )
//     }
//     formatSpecificDate(date: Date): string | null {
//         return this.datePipe.transform(date, 'MM.dd.yyyy HH:mm:ss');
//     }
// }
