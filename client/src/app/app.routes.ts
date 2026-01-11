import { Routes } from '@angular/router';
import { Room } from './room/room';
import { Auth } from './auth/auth';
import { Home } from './home/home';
import { Error } from './error/error';

export const routes: Routes = [
    {path:"room", component: Room},
    {path:"user-auth", component: Auth},
    {path:"home", component: Home},
    {path:"error", component: Error},
];
