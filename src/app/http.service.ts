import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private configUrl: string;

  constructor(private http: HttpClient) {
    this.configUrl = "/api/";
  }

  public getBankInfo(_amount: number, _ssn: string, _email: string, _bank: string): Observable<any> {
    return this.http.post(this.configUrl + 'getBankInfo', {amount: _amount, ssn: _ssn, email: _email, bank: _bank}, httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
