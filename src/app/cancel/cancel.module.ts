import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelRoutingModule } from './cancel-routing.module';
import { CancelComponent } from './cancel.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CancelComponent
  ],
  imports: [
    CommonModule,
    CancelRoutingModule,
    ReactiveFormsModule
  ]
})
export class CancelModule { }
