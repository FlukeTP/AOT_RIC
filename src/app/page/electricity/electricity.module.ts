import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { Ele002Component } from './ele002/ele002.component';
import { Ele003Component } from './ele003/ele003.component';
import { Ele001Component } from './ele001/ele001.component';
import { Ele002detailComponent } from './ele002detail/ele002detail.component';
import { Ele003detailComponent } from './ele003detail/ele003detail.component';
import { Ele004Component } from './ele004/ele004.component';
import { Ele004detailComponent } from './ele004detail/ele004detail.component';
import { Ele005Component } from './ele005/ele005.component';
import { Ele005detailComponent } from './ele005detail/ele005detail.component';
import { Ele006Component } from './ele006/ele006.component';
import { Ele006detailComponent } from './ele006detail/ele006detail.component';
import { Ele007Component } from './ele007/ele007.component';
import { Ele007detailComponent } from './ele007detail/ele007detail.component';
import { Ele008Component } from './ele008/ele008.component';
import { Ele008detailComponent } from './ele008detail/ele008detail.component';
import { Ele009Component } from './ele009/ele009.component';
import { Ele009detailComponent } from './ele009detail/ele009detail.component';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

const routes: Routes = [
  { path: '', redirectTo: '/home/elec', pathMatch: 'full' },
  { path: 'ele001', component: Ele001Component },
  { path: 'ele002', component: Ele002Component },
  { path: 'ele003', component: Ele003Component },
  // { path: 'ele004', component: Ele004Component },
  { path: 'ele005', component: Ele005Component },
  { path: 'ele006', component: Ele006Component },
  { path: 'ele007', component: Ele007Component },
  { path: 'ele008', component: Ele008Component },
  { path: 'ele009', component: Ele009Component },
  { path: 'ele002detail', component: Ele002detailComponent },
  { path: 'ele003detail', component: Ele003detailComponent },
  // { path: 'ele004detail', component: Ele004detailComponent },
  { path: 'ele005detail', component: Ele005detailComponent },
  { path: 'ele006detail', component: Ele006detailComponent },
  { path: 'ele007detail', component: Ele007detailComponent },
  { path: 'ele008detail', component: Ele008detailComponent },
  { path: 'ele009detail', component: Ele009detailComponent },

];

@NgModule({
  declarations: [
    Ele002Component,
    Ele003Component,
    Ele001Component,
    Ele003detailComponent,
    Ele002detailComponent,
    Ele003detailComponent,
    Ele004Component,
    Ele004detailComponent,
    Ele005Component,
    Ele005detailComponent,
    Ele006Component,
    Ele006detailComponent,
    Ele007Component,
    Ele007detailComponent,
    Ele008Component,
    Ele008detailComponent,
    Ele009Component,
    Ele009detailComponent
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
export class ElectricityModule { }
