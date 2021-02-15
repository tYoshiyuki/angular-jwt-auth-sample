import { Injectable } from '@angular/core';
import { JwtToken } from './jwt-token';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // TODO 実際の環境に応じて、値を書き換える必要があります。
  private readonly cognitoRedirectUrl: string = 'xxx';
  private readonly userPoolWebClientId = 'xxx';
  private readonly cognitoBaseUrl = 'xxx';

  constructor(private httpClient: HttpClient) { }

  /**
   * 現在のトークン情報を取得します。
   */
  get currentToken(): JwtToken | null {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(token) as JwtToken : null;
  }

  /**
   * 現在のトークン情報を設定します。
   *
   * @param token
   */
  set currentToken(token: JwtToken | null) {
    if (token){
      localStorage.setItem('token', JSON.stringify(token));
    }
  }

  /**
   * 認証コードを取得します。
   */
  getAuthCode() {
    window.location.href = `${this.cognitoBaseUrl}/oauth2/authorize?identity_provider=COGNITO&response_type=code&client_id=${this.userPoolWebClientId}&redirect_uri=${this.cognitoRedirectUrl}`;
  }

  /**
   * JWTトークンを取得します。
   *
   * @param code
   */
  async getToken(code: string) {
    return await this.postCognito(code).then(x => ({
        accessToken: x.access_token,
        expiresIn: x.expires_in,
        idToken: x.id_token,
        refreshToken: x.refresh_token,
        tokenType: x.token_type,
      } as JwtToken)
    );
  }

  /**
   * Cognitoへトークンの取得を行います。
   *
   * @param code
   * @private
   */
  private postCognito(code: string) {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('redirect_uri', this.cognitoRedirectUrl)
      .set('code', code)
      .set('client_id', this.userPoolWebClientId);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.httpClient.post(this.cognitoBaseUrl + '/oauth2/token', body, { headers })
      .toPromise<any>();
  }
}
