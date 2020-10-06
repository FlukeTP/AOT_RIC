import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SystemConstantComponent } from './system-constant/system-constant.component';
import { SystemConstantMangementComponent } from './system-constant-mangement/system-constant-mangement.component';


const routes: Routes = [
  { path: '', component: SystemConstantComponent },
  { path: 'detail', component: SystemConstantMangementComponent }
];

@NgModule({
  declarations: [SystemConstantComponent, SystemConstantMangementComponent],
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
export class ConstantModule { }
