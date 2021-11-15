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
  private cancelSpecificSub: Subscription | undefined;
  public cancelForm: FormGroup;
  public submitted: boolean;
  public loading: boolean;
  public message: string;
  public success: boolean;
  public autogiros: any;

  // Cancel specific
  public loadingStart: boolean;
  public selectedIndex: number;
  public successStart: boolean;
  public messageStart: string;

  constructor(private http: HttpService, private formBuilder: FormBuilder) {
    this.cancelForm = this.formBuilder.group({
      email: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]]
    });

    this.submitted = false;
    this.loading = false;
    this.message = "";
    this.success = false;
    this.loadingStart = false;
    this.selectedIndex = 0;
    this.successStart = false;
    this.messageStart = '';
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.cancelSub) {
      this.cancelSub.unsubscribe();
    }
    if (this.cancelSpecificSub) {
      this.cancelSpecificSub.unsubscribe();
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
        this.message = 'Vi lyckades hitta följande autogiro, avsluta de du vill:'
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

  public cancelSpecific(index: number): void {
    this.selectedIndex = index;
    this.loadingStart = true;
    this.messageStart = '';
    this.successStart = false;

    this.cancelSpecificSub = this.http.cancelSpecific(this.f.email.value, this.f.ssn.value, this.autogiros[index]['public_id'])
      .subscribe(data => {
        if (data['success']) {
          this.loadingStart = false;
          this.successStart = true;
          this.messageStart = data['msg'];
          this.autogiros.pop(this.selectedIndex);
        } else if (data['err']) {
          this.loadingStart = false;
          this.successStart = false;
          this.messageStart = data['err'];
        } else {
          this.loadingStart = false;
          this.successStart = false;
          this.messageStart = 'Ett okänt fel inträffade.';
        }
      }, err => {
        this.loadingStart = false;
        this.successStart = false;
        this.messageStart = err;
      });
  }
}
