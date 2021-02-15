import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private router: Router) { }

  async ngOnInit() {
    if (this.authService.currentToken){
      // TODO 有効期限をチェックし、有効期限が近い (切れている) 場合は、トークンの再取得を行います
      return;
    }

    const code = this.activatedRoute.snapshot.queryParams.code;
    if (!code) {
      // 認証コードを取得します
      this.authService.getAuthCode();
    } else {
      // アクセストークンを取得します
      this.authService.currentToken = await this.authService.getToken(code);

      // 認証コード再利用防止のため、URLパラメータをクリアします
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
}
