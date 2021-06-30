import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {

  public donateForm: FormGroup;
  public chooseVisible: boolean;
  public submitted: boolean;
  public loading: boolean;
  private donateSub: any;

  constructor(private formBuilder: FormBuilder,
              private http: HttpService) {
    // Initiate form
    this.donateForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(50)]],
      ssn: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern("^[0-9]*$")]],
      email: ['', Validators.required],
      bank: ['', Validators.required]
    });

    this.chooseVisible = false;
    this.submitted = false;
    this.loading = false;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }

  public get f(): FormGroup['controls'] {
    return this.donateForm.controls;
  }

  // Submit form
  public submit(): void {
    this.submitted = false;
    this.submitted = true;
    this.loading = true;

    if (this.donateForm.invalid) {
      console.log(this.f.ssn.errors);
      console.log(this.f.email.errors);
      console.log(this.f.bank.errors);
      this.loading = false;
      return;
    }

    console.log(this.donateForm.controls['amount'].value);
    // Let's send it to http
    this.donateSub = this.http.getBankInfo(
      this.donateForm.controls['amount'].value, 
      this.donateForm.controls['ssn'].value,
      this.donateForm.controls['email'].value,
      this.donateForm.controls['bank'].value).subscribe(data => {
        console.log(data);
    })
    
  }

  // Change the amount to donate manually
  public changeAmount(amount: number): void {
    this.donateForm.controls['amount'].setValue(amount);
  }

  // Show the optional monthly amount
  public toggleChoose(): void {
    this.chooseVisible = !this.chooseVisible;
  }

}
