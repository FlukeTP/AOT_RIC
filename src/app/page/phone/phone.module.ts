import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { Phone001Component } from './phone001/phone001.component';
import { Phone001detailComponent } from './phone001detail/phone001detail.component';
import { Phone002Component } from './phone002/phone002.component';
import { Phone002detailComponent } from './phone002detail/phone002detail.component';
import { Phone004Component } from './phone004/phone004.component';
import { Phone004detailComponent } from './phone004detail/phone004detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Phone003Component } from './phone003/phone003.component';
import { Phone003detailComponent } from './phone003detail/phone003detail.component';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

const routes: Routes = [
  { path: '', redirectTo: '/home/phone', pathMatch: 'full' },
  { path: 'phone001', component: Phone001Component },
  { path: 'phone002', component: Phone002Component },
  { path: 'phone003', component: Phone003Component },
  { path: 'phone004', component: Phone004Component },
  { path: 'phone001detail', component: Phone001detailComponent },
  { path: 'phone002detail', component: Phone002detailComponent },
  { path: 'phone003detail', component: Phone003detailComponent },
  { path: 'phone004detail', component: Phone004detailComponent }
];

@NgModule({
  declarations: [
    Phone001Component,
    Phone001detailComponent,
    Phone002Component,
    Phone002detailComponent,
    Phone003Component,
    Phone003detailComponent,
    Phone004Component,
    Phone004detailComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    PipeModule,
    TypeaheadModule.forRoot()
  ],
  exports: [RouterModule],
})
export class PhoneModule { }
