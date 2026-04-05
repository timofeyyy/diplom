import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Route, Router } from '@angular/router';
import { AuthHttpService } from '../../service/http/auth.http.service';
import { AuthHttpRequirementService } from '../../service/http/auth.http.requirements.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '../../dto/warning.dto';

@Component({
  selector: 'app-update-password-window',
  imports: [],
  providers: [],
  templateUrl: './update-password-window.html',
  styleUrl: './update-password-window.css',
})
export class UpdatePasswordWindow implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authHttp: AuthHttpService,
    private readonly authHttpRequirements: AuthHttpRequirementService,
  ) {

  }
  response!: HttpResponse
  ngOnInit(): void {
    const passid = this.activatedRoute.snapshot.paramMap.get('passid')
    if (passid) {
      this.authHttpRequirements.require(this.authHttp.updatePassword(passid))
        .subscribe((res: (HttpResponse | HttpErrorResponse)) => {
          if ("error" in res) {

          }
          else {
            this.response = res
            this.logout()
          }
          console.log(res)
        })
    }
  }
  logout() {
    this.authHttpRequirements.require(this.authHttp.logout())
      .subscribe((res: (null | HttpErrorResponse)) => {
        if (!res) {
          console.log("logged out")
        }
        else {
          console.log(res.message)
        }
      })
  }
  auth() {
    this.router.navigate(['/user-auth'])
  }
}
