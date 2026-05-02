import { Routes } from '@angular/router';
import { Room } from './room/room';
import { Auth } from './auth/auth';
import { Home } from './home/home';
import { Error } from './error/error';
import { Test } from './test/test';
import { UpdatePasswordWindow } from './update-password-window/update-password-window';
import { Friends } from './friends/friends';
import { appGuard } from './app.guard';
import { ThemePicker } from '../themes/theme-picker/theme-picker';

export const routes: Routes = [
    {path:"room", component: Room, canActivate: [appGuard]},
    {path:"user-auth", component: Auth},
    {path:"home", component: Home, canActivate: [appGuard]},
    {path:"error", component: Error},
    {path:"test", component: ThemePicker},
    {path:"friends", component: Friends, canActivate: [appGuard]},
    {path:"new-password/:passid", component: UpdatePasswordWindow},
];
