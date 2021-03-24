import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JwtToken } from './jwt-token';
import { HttpParams } from '@angular/common/http';


describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  let store: { [name: string]: string | null } = {};
  const mockLocalStorage = {
    getItem: (key: string): string | null => key in store ? store[key] : null,
    setItem: (key: string, value: string) => {
      store[key] = `${value}`;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);

    spyOn(localStorage, 'getItem')
      .and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem')
      .and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem')
      .and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear')
      .and.callFake(mockLocalStorage.clear);
  });

  it('初期化できることを確認します。', () => {
    expect(service).toBeTruthy();
  });

  it('トークンが取得できることを確認します。', async () => {

    // Arrange
    const response = {
      /* eslint-disable @typescript-eslint/naming-convention */
      access_token: 'This is accessToken.',
      expires_in: 'This is expiresIn.',
      id_token: 'This is idToken.',
      refresh_token: 'This is refreshToken.',
      token_type: 'This is tokenType.',
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
    };

    const expectedToken = {
      accessToken: 'This is accessToken.',
      expiresIn: 'This is expiresIn.',
      idToken: 'This is idToken.',
      refreshToken: 'This is refreshToken.',
      tokenType: 'This is tokenType.',
    } as JwtToken;

    const code = '';

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('redirect_uri', 'http://localhost:4200/login')
      .set('code', code)
      .set('client_id', '4d2fn18gapfu4boet0otsp8516');

    // Act
    const result = service.getToken(code);

    // Assert
    const testRequest = httpTestingController.expectOne('https://sampletestapp.auth.ap-northeast-1.amazoncognito.com' + '/oauth2/token');
    expect(testRequest.request.method).toEqual('POST');
    expect(testRequest.request.headers.get('Content-Type')).toEqual('application/x-www-form-urlencoded');
    expect(testRequest.request.body).toEqual(body);

    // Act
    testRequest.flush(response);
    const token = await result;

    // Assert
    expect(token).toEqual(expectedToken);

    // Assert (TearDown)
    httpTestingController.verify();
  });

});
