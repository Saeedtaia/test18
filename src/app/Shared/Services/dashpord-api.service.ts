import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashpordAPIService {

  constructor(private _HttpClient: HttpClient) { }
  GetTransactionsData(): Observable<any>
  {
    return this._HttpClient.get('https://api.jsonbin.io/v3/b/66906c9cad19ca34f8864674',
      {
        headers: {
          'X-Master-Key': '$2a$10$is/6FcgMNSBFq5jA1OGPGOK9PyrzaFSu6GfVR.jBTuObl7aIWEQKu',
          'X-Acscess-Key':'$2a$10$is/6FcgMNSBFq5jA1OGPGOK9PyrzaFSu6GfVR.jBTuObl7aIWEQKu'
        }
      }
    )
  }
}
