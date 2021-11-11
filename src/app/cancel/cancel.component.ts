import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  private cancelSub: Subscription | undefined;
  public cancelForm: FormGroup;
  public submitted: boolean;

  constructor(private http: HttpService,
              private formBuilder: FormBuilder) {
                this.cancelForm = this.formBuilder.group({
                  email: ['', Validators.required],
                  ssn: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]]
                });

                this.submitted = false;
              }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.cancelSub) {
      this.cancelSub.unsubscribe();
    }
  }

  public get f(): FormGroup['controls'] {
    return this.cancelForm.controls;
  }

  public submit(): void {
    this.submitted = true;
    this.cancelSub = this.http.cancelAutogiro("kevin.rasmusson@hotmail.com").subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    })
  }

}
