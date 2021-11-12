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
  public loading: boolean;
  public message: string;
  public success: boolean;
  public autogiros: any;

  constructor(private http: HttpService, private formBuilder: FormBuilder) {
    this.cancelForm = this.formBuilder.group({
      email: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]]
    });

    this.submitted = false;
    this.loading = false;
    this.message = "";
    this.success = false;
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
    this.loading = true;
    if (this.cancelForm.invalid) {
      this.loading = false;
      return;
    }

    this.cancelSub = this.http.cancelAutogiro(
      this.f.email.value,
      this.f.ssn.value
    ).subscribe(data => {
      console.log(data);
      if (data['success']) {
        this.loading = false;
        this.success = true;
        this.message = 'Vi lyckades hitta följande autogiro, avsluta de/den du vill:'
        this.autogiros = data['users'];
      } else if (data['err']) {
        this.loading = false;
        this.success = false;
        this.message = data['err'];
      } else {
        this.loading = false;
        this.success = false;
        this.message = "Ett okänt fel inträffade. Vänligen kontakta oss.";
      }
    }, err => {
      this.loading = false;
      this.success = false;
      this.message = "Ett fel inträffade vid kommunikation med vår server.";
    });
  }



}
