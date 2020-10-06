import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Generalinfo001Component } from './generalinfo001/generalinfo001.component';
import { Generalinfo002Component } from './generalinfo002/generalinfo002.component';
import { Generalinfo003Component } from './generalinfo003/generalinfo003.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

const routes: Routes = [

  { path: 'generalinfo001', component: Generalinfo001Component },
  { path: 'generalinfo002', component: Generalinfo002Component },
  { path: 'generalinfo003', component: Generalinfo003Component },

];

@NgModule({
  declarations: [

    Generalinfo001Component,
    Generalinfo002Component,
    Generalinfo003Component],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [RouterModule],
})
export class GeneralinfoModule { }
