import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.http.getTest().subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    })
  }

}
