import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ListofvalueComponent } from './listofvalue/listofvalue.component';
import { ListofvaluedetailComponent } from './listofvaluedetail/listofvaluedetail.component';
import { ListofvaluemangementComponent } from './listofvaluemangement/listofvaluemangement.component';
const routes: Routes = [
  { path: '', component: ListofvalueComponent },
  { path: 'detail', component: ListofvaluedetailComponent },
  { path: 'management' , component:ListofvaluemangementComponent}
];

@NgModule({
  declarations: [ListofvalueComponent, ListofvaluedetailComponent, ListofvaluemangementComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    ComponentsModule,
    BsDatepickerModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [RouterModule]
})
export class LovModule { }
