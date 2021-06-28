import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private formBuilder: FormBuilder) {
    // Initiate form
    this.donateForm = this.formBuilder.group({
      amount: ['', Validators.required],
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

  public get f(): FormGroup['controls'] {
    return this.donateForm.controls;
  }

  // Submit form
  public submit(): void {
    this.submitted = true;
    this.loading = true;

    if (this.donateForm.invalid) {
      this.loading = false;
      return;
    }

    console.log('hello');
    
  }

  public changeAmount(amount: number): void {

  }

  public toggleChoose(): void {
    this.chooseVisible = !this.chooseVisible;
  }

}
