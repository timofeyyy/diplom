import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../service/app-config.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  imports: [NgIf, HttpClientModule],
  providers: [AppConfigService],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appConfig: AppConfigService
  ) {}

  config: any
  ngOnInit(): void {
    this.appConfig.getConfig().subscribe((config: any) => {
      this.config = config
    })
  }

  login: boolean = true

  signInThroughGoogle() : void {
    //   this.router.navigate(['/auth-serv/auth/google']);

    // this.router.navigateByUrl(`https://localhost:3000/auth-serv/auth/google`).then((data) => console.log(data))
  }

}

