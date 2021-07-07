import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../http.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  public loadingBankid: boolean;
  public success: boolean;
  public message: string;
  public accounts: any;
  public legit: boolean;
  public qr: string;

  // Subs
  private donateSub: any;
  private pollSub: any;

  constructor(private formBuilder: FormBuilder,
              private http: HttpService,
              private sanitizer: DomSanitizer) {
    // Initiate form
    this.donateForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(50)]],
      ssn: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      email: ['', Validators.required],
      bank: ['', Validators.required]
    });

    this.chooseVisible = false;
    this.submitted = false;
    this.loading = false;
    this.loadingBankid = false;
    this.success = false;
    this.message = "";
    this.legit = false;
    this.qr = '';
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.donateSub) {
      this.donateSub.unsubscribe();
    }

    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
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
        this.loading = false;
        if (data['success']) {
          this.success = true;
          this.message = 'Öppna Mobilt BankID och legitimera dig';
          this.loadingBankid = true;
          // Here we need to start the polling
          this.poll(data['msg']);
        } else if (data['err']) {
          this.success = false;
          this.message = data['err'];
        } else {
          this.success = false;
          this.message = "Unknown error.";
        }
    })
    
  }

  private poll(publicId: string): void {
    this.http.pollBankInfo(publicId).subscribe(data => {
      this.loadingBankid = false;
      if (data['qr'] && data['status'] == 'Waiting') {
        this.loadingBankid = true;
        this.qr = data['qr'];
        this.poll(data['publicId']);
      } else if (data['success']) {
        this.success = true;
        this.message = 'Legitimeringen lyckades. Välj konton nedan:';
        this.legit = true;
        this.accounts = data['accounts'];
        console.log(this.accounts)
      } else if (data['err']) {
        this.success = false;
        this.message = data['err'];
      } else {
        this.success = false;
        this.message = 'Unknown error.';
      }
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

  // Sanitize
  public sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
