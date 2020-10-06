import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { Cndn001Component } from './cndn001/cndn001.component';
import { Cndn001detailComponent } from './cndn001detail/cndn001detail.component';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

const routes: Routes = [
  { path: '', redirectTo: '/cndn', pathMatch: 'full' },
  { path: 'cndn001', component: Cndn001Component },
  { path: 'cndn001detail', component: Cndn001detailComponent }

];

@NgModule({
  declarations: [
    Cndn001Component,
    Cndn001detailComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    PipeModule,
    TypeaheadModule.forRoot()
  ],
  exports: [RouterModule],
})
export class CndnModule { }
