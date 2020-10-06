import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Communi001Component } from './communi001/communi001.component'
import { Communi001detailComponent } from './communi001detail/communi001detail.component';
import { Communi002Component } from './communi002/communi002.component';
import { Communi002detailComponent } from './communi002detail/communi002detail.component';
import { Communi003Component } from './communi003/communi003.component';
import { Communi003detailComponent } from './communi003detail/communi003detail.component';
import { Communi004Component } from './communi004/communi004.component';
import { Communi004datailComponent } from './communi004datail/communi004datail.component';
import { Communi005Component } from './communi005/communi005.component';
import { Communi005detailComponent } from './communi005detail/communi005detail.component';
import { Communi006Component } from './communi006/communi006.component';
import { Communi0061Component } from './communi0061/communi0061.component';
import { Communi0061detailComponent } from './communi0061detail/communi0061detail.component';
import { Communi0062Component } from './communi0062/communi0062.component';
import { Communi0062detailComponent } from './communi0062detail/communi0062detail.component';
import { Communi0063Component } from './communi0063/communi0063.component';
import { Communi0063detailComponent } from './communi0063detail/communi0063detail.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { Communi007Component } from './communi007/communi007.component';
import { Communi008Component } from './communi008/communi008.component';


const routes: Routes = [
  { path: 'communi001', component: Communi001Component },
  { path: 'communi002', component: Communi002Component },
  { path: 'communi003', component: Communi003Component },
  { path: 'communi004', component: Communi004Component },
  { path: 'communi005', component: Communi005Component },
  { path: 'communi006', component: Communi006Component },
  { path: 'communi007', component: Communi007Component },
  { path: 'communi008', component: Communi008Component },
  { path: 'communi0061', component: Communi0061Component },
  { path: 'communi0062', component: Communi0062Component },
  { path: 'communi0063', component: Communi0063Component },
  { path: 'communi001detail', component: Communi001detailComponent },
  { path: 'communi002detail', component: Communi002detailComponent },
  { path: 'communi003detail', component: Communi003detailComponent },
  { path: 'communi004detail', component: Communi004datailComponent },
  { path: 'communi005detail', component: Communi005detailComponent },
  { path: 'communi0061detail', component: Communi0061detailComponent },
  { path: 'communi0062detail', component: Communi0062detailComponent },
  { path: 'communi0063detail', component: Communi0063detailComponent },
];

@NgModule({
  declarations: [
    Communi001Component,
    Communi001detailComponent,
    Communi002Component,
    Communi002detailComponent,
    Communi003Component,
    Communi003detailComponent,
    Communi004Component,
    Communi004datailComponent,
    Communi005Component,
    Communi005detailComponent,
    Communi006Component,
    Communi0061Component,
    Communi0061detailComponent,
    Communi0062Component,
    Communi0062detailComponent,
    Communi0063Component,
    Communi0063detailComponent,
    Communi007Component,
    Communi008Component

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
export class CommuniModule { }
