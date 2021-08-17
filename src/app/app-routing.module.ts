import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DonateComponent } from './donate/donate.component';
import { ContactComponent } from './contact/contact.component';
import { TosComponent } from './tos/tos.component';

const routes: Routes = [
  {
    path: 'donate',
    component: DonateComponent
  },
  {
    path: 'tos',
    component: TosComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  { path: 'cancel', loadChildren: () => import('./cancel/cancel.module').then(m => m.CancelModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
