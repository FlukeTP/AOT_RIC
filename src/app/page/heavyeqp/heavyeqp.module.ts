import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

import { Heavyeqp001Component } from './heavyeqp001/heavyeqp001.component';
import { Heavyeqp001detailComponent } from './heavyeqp001detail/heavyeqp001detail.component';
import { Heavyeqp002Component } from './heavyeqp002/heavyeqp002.component';
import { Heavyeqp002detailComponent } from './heavyeqp002detail/heavyeqp002detail.component';
import { Heavyeqp003Component } from './heavyeqp003/heavyeqp003.component';
import { Heavyeqp003detailComponent } from './heavyeqp003detail/heavyeqp003detail.component';
import { Heavyeqp004Component } from './heavyeqp004/heavyeqp004.component';
import { Heavyeqp004detailComponent } from './heavyeqp004detail/heavyeqp004detail.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: 'heavyeqp001', component: Heavyeqp001Component },
  { path: 'heavyeqp002', component: Heavyeqp002Component },
  { path: 'heavyeqp003', component: Heavyeqp003Component },
  { path: 'heavyeqp004', component: Heavyeqp004Component },
  { path: 'heavyeqp001detail', component: Heavyeqp001detailComponent },
  { path: 'heavyeqp002detail', component: Heavyeqp002detailComponent },
  { path: 'heavyeqp003detail', component: Heavyeqp003detailComponent },
  { path: 'heavyeqp004detail', component: Heavyeqp004detailComponent },
];

@NgModule({
  declarations: [

    Heavyeqp001Component,
    Heavyeqp001detailComponent,
    Heavyeqp002Component,
    Heavyeqp002detailComponent,
    Heavyeqp003Component,
    Heavyeqp003detailComponent,
    Heavyeqp004Component,
    Heavyeqp004detailComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [RouterModule],
})
export class HeavyeqpModule { }
