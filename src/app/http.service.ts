import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Autogiro } from './autogiro';

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
  private autogiroUrl: string;
  private cancelUrl: string;

  constructor(private http: HttpClient) {
    this.configUrl = "/api/";
    this.autogiroUrl = "autogiro/";
    this.cancelUrl = "cancel/";
  }

  // Post the bank info from autogiro form and return the bank info
  public getBankInfo(_amount: number, _ssn: string, _email: string, _bank: string): Observable<any> {
    return this.http.post(this.configUrl + this.autogiroUrl + 'getBankInfo', {amount: _amount, ssn: _ssn, email: _email, bank: _bank}, httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Poll for bank info
  public pollBankInfo(_publicId: string): Observable<any> {
    return this.http.post(this.configUrl + this.autogiroUrl + 'pollBankInfo', {publicId: _publicId}, httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Start the autogiro
  public startAutogiro(autogiro: Autogiro): Observable<any> {
    return this.http.post<any>(this.configUrl + this.autogiroUrl + 'startAutogiro', autogiro, httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Retrieve the autogiro able to be cancelled
  public cancelAutogiro(_email: string, _ssn: string): Observable<any> {
    return this.http.post<any>(this.configUrl + this.cancelUrl + 'cancelAutogiro', {email: _email, ssn: _ssn}, httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Cancel specific autogiro
  public cancelSpecific(_email: string, _ssn: string, _publicId: string): Observable<any> {
    return this.http.post<any>(this.configUrl + this.cancelUrl + 'cancelSpecificAutogiro',
      {email: _email, ssn: _ssn, publicId: _publicId}, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      return throwError(
        'Client error occured.'
      );
    } else {
      console.log(error.error);
      return throwError(
        'Back-end returned code (' + error.status + ') with message: ' + error.error.err
      )
    }
  }
}
