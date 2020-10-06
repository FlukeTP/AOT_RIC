import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Firebrigade001Component } from './firebrigade001/firebrigade001.component';
import { Firebrigade001detailComponent } from './firebrigade001detail/firebrigade001detail.component';
import { Firebrigade002Component } from './firebrigade002/firebrigade002.component';
import { Firebrigade002detailComponent } from './firebrigade002detail/firebrigade002detail.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';




const routes: Routes = [
  { path: 'firebrigade001', component: Firebrigade001Component },
  { path: 'firebrigade002', component: Firebrigade002Component },
  { path: 'firebrigade001detail', component: Firebrigade001detailComponent },
  { path: 'firebrigade002detail', component: Firebrigade002detailComponent },
];

@NgModule({
  declarations: [
    Firebrigade001Component,
    Firebrigade001detailComponent,
    Firebrigade002Component,
    Firebrigade002detailComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule.forRoot()
  ],
  exports: [RouterModule],
})
export class FirebrigadeModule { }
