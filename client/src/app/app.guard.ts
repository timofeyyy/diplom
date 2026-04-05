import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AppEnum } from "../etc/enum/app.enum";
import { SocketUserService } from "../service/socket/socket.user.service";
import { SocketNotificationService } from "../service/socket/socket.notification.service";

export const appGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userService = inject(SocketUserService)
    const notficationService = inject(SocketNotificationService)
    const router = inject(Router);
    try {
        userService.connect()
        notficationService.connect()
        return true
    }  
    catch {
        return router.parseUrl("/user-auth")
    }
}; 