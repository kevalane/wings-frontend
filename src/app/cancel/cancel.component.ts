import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  private cancelSub: Subscription | undefined;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.submit();
  }

  ngOnDestroy(): void {
    if (this.cancelSub) {
      this.cancelSub.unsubscribe();
    }
  }

  public submit(): void {
    this.cancelSub = this.http.cancelAutogiro("kevin.rasmusson@hotmail.com").subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    })
  }

}
