import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Autogiro } from '../autogiro';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { timer } from 'rxjs';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css'],
  animations: [
    trigger('slideInOutAnimation', [
      state('*', style({
      })),
      transition(':enter', [
        style({
          height: 0,
          opacity: 0
        }),
        animate('.3s ease-out', style({
          height: '90.8px',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        animate('.3s ease-in', style({
          height: 0,
          opacity: 0
        }))
      ])
    ])
  ]
})
export class DonateComponent implements OnInit {

  public donateForm: FormGroup;
  public chooseVisible: boolean;
  public submitted: boolean;
  public loading: boolean;
  public loadingBankid: boolean;
  public loadingStart: boolean;
  public success: boolean;
  public message: string;
  public accounts: any;
  public legit: boolean;
  public qr: string;
  public selectedIndex: number;
  public autogiroSuccess: boolean;
  public autogiroMessage: string;
  public disabled: boolean;
  public disabledAcc: boolean;
  public openOnMobile: boolean;

  // Subs
  private donateSub: any;
  private pollSub: any;
  private startSub: any;

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
    this.loadingStart = false;
    this.success = false;
    this.message = "";
    this.legit = false;
    this.qr = '';
    this.selectedIndex = -1;
    this.autogiroMessage = '';
    this.autogiroSuccess = false;
    this.disabled = false;
    this.disabledAcc = false;
    this.openOnMobile = false;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subs on destroy
    if (this.donateSub) {
      this.donateSub.unsubscribe();
    }

    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }

    if (this.startSub) {
      this.startSub.unsubscribe();
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
      this.success = false;
      this.message = 'Samtliga fält måste fyllas i korrekt.';
      return;
    }

    // Let's send it to http
    this.donateSub = this.http.getBankInfo(
      this.donateForm.controls['amount'].value, 
      this.donateForm.controls['ssn'].value,
      this.donateForm.controls['email'].value,
      this.donateForm.controls['bank'].value).subscribe(data => {
        this.loading = false;
        if (data['success']) {
          this.disabled = true;
          this.success = true;
          // this.message = 'Öppna Mobilt BankID och legitimera dig';
          if (this.openOnMobile) {
            this.message = 'Vänta på att Mobilt BankID öppnas och legitimera dig sedan.';
          } else {
            this.message = 'Scanna QR-koden som kommer snart och legitimera dig.';
          }
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
    this.pollSub = this.http.pollBankInfo(publicId).subscribe(data => {
      this.loadingBankid = false;
      if (data['qr'] && data['status'] == 'Waiting') {
        // Recursive call WITH QR

        // if mobile clicked
        if (this.openOnMobile) {
          if (data['token']) {
            // window.location.href = 'https://app.bankid.com/?autostarttoken=' + data['token'] + '&redirect=https://bidra.wings.se';
            // window.location.href = 'bankid:///?autostarttoken=' + data['token'] + '&redirect=https://bidra.wings.se';
            window.open(
              'https://app.bankid.com/?autostarttoken=' + data['token'] + '&redirect=null',
              '_blank'
            );
          }
        } else {
          this.qr = data['qr'];
        }

        this.loadingBankid = true;
        this.pollSub.unsubscribe();
        timer(1000).subscribe(x => {
          this.poll(data['publicId']);
        });
      } else if (data['status'] == 'Waiting') {
        // Recursive call WITHOUT QR

        // if mobile clicked
        if (this.openOnMobile) {
          if (data['token']) {
            // window.location.href = 'https://app.bankid.com/?autostarttoken=' + data['token'] + '&redirect=https://bidra.wings.se';
            // window.location.href = 'bankid:///?autostarttoken=' + data['token'] + '&redirect=https://bidra.wings.se';
            window.open(
              'https://app.bankid.com/?autostarttoken=' + data['token'] + '&redirect=null',
              '_blank'
            );
          }
        }
        this.loadingBankid = true;
        this.pollSub.unsubscribe();
        timer(1000).subscribe(x => {
          this.poll(data['publicId']);
        });
      } else if (data['success']) {
        // When we succeeded
        this.qr = '';
        this.success = true;
        this.message = 'Legitimeringen lyckades. Välj konton nedan:';
        this.legit = true;
        this.accounts = data['accounts'];
      } else if (data['err']) {
        // If just an error
        this.disabled = false;
        this.qr = '';
        this.success = false;
        this.message = data['err'];
      } else {
        // Catch unknown errors
        this.disabled = false;
        this.qr = '';
        this.success = false;
        this.message = 'Unknown error.';
      }
    })
  }

  // Actually start the autogiro
  public startAutogiro(clearingNumber: string, accountNumber: string, holderName: string, index: number): void {
    this.selectedIndex = index;
    this.loadingStart = true;

    const autogiro: Autogiro = {
      email: this.f.email.value,
      ssn: this.f.ssn.value,
      name: holderName,
      clearingNumber: clearingNumber,
      accountNumber: accountNumber,
      bank: this.f.bank.value,
      amount: this.f.amount.value
    }

    this.startSub = this.http.startAutogiro(autogiro).subscribe(data => {
      this.loadingStart = false;
      this.disabledAcc = true;
      if (data['success']) {
        this.disabledAcc = true;
        this.autogiroMessage = 'Registreringen lyckades. Tack för att just Du blivit månadsgivare. Du kommer nu att omdirigeras ...';
        this.autogiroSuccess = true;
        setTimeout(() => {
          window.location.href = 'https://wings.se/manadsgivare';
        }, 5000)
      } else if (data['err']) {
        this.disabledAcc = false;
        this.autogiroMessage = 'Registreringen misslyckades. Försök igen eller kontakta oss så hjälper vi dig!';
        this.autogiroSuccess = false;
      } else {
        this.disabledAcc = false;
        this.autogiroSuccess = false;
        this.autogiroMessage = 'Ett okänt fel inträffande när vi skulle registrera dig som månadsgivare. Vänligen kontakta oss så löser vi detta.';
      }
    }, err => {
      this.loadingStart = false;
      this.disabledAcc = false;
      this.autogiroSuccess = false;
      this.autogiroMessage = err;
    });
  }

  // Change the amount to donate manually
  public changeAmount(amount: number): void {
    this.donateForm.controls['amount'].setValue(amount);
    if (this.chooseVisible) {
      this.chooseVisible = false;
    }
  }

  // Show the optional monthly amount
  public toggleChoose(): void {
    this.chooseVisible = true;
    if (this.chooseVisible) {
      this.donateForm.controls.amount.updateValueAndValidity();
    }
  }

  // Sanitize
  public sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  // checkbox
  public onCheckboxChange(event: any): void {
    if (event.type == 'change') {
      this.openOnMobile = !this.openOnMobile;
    }
  }

}
