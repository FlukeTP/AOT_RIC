import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { Pos001Component } from './pos001/pos001.component';
import { Pos001detailComponent } from './pos001detail/pos001detail.component';
import { Pos002Component } from './pos002/pos002.component';
import { Pos002detailComponent } from './pos002detail/pos002detail.component';
import { Pos003Component } from './pos003/pos003.component';
import { Pos003detailComponent } from './pos003detail/pos003detail.component';
import { Pos004Component } from './pos004/pos004.component';
import { Pos004detailComponent } from './pos004detail/pos004detail.component';



const routes: Routes = [
  { path: '', redirectTo: '/home/pos', pathMatch: 'full' },
  { path: 'pos001', component: Pos001Component },
  { path: 'pos002', component: Pos002Component },
  { path: 'pos003', component: Pos003Component },
  { path: 'pos004', component: Pos004Component },
  { path: 'pos001detail', component: Pos001detailComponent },
  { path: 'pos002detail', component: Pos002detailComponent },
  { path: 'pos003detail', component: Pos003detailComponent },
  { path: 'pos004detail', component: Pos004detailComponent },
];

@NgModule({
  declarations: [
  Pos001Component,
  Pos001detailComponent,
  Pos002Component,
  Pos002detailComponent,
  Pos003Component,
  Pos003detailComponent,
  Pos004Component,
  Pos004detailComponent],
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
export class PosModule { }
