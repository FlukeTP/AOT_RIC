import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Garbagedis001Component } from './garbagedis001/garbagedis001.component';
import { Garbagedis001detailComponent } from './garbagedis001detail/garbagedis001detail.component';
import { Garbagedis002Component } from './garbagedis002/garbagedis002.component';
import { Garbagedis002detailComponent } from './garbagedis002detail/garbagedis002detail.component';
import { Garbagedis003Component } from './garbagedis003/garbagedis003.component';
import { Garbagedis0301Component } from './garbagedis0301/garbagedis0301.component';
import { Garbagedis0301detailComponent } from './garbagedis0301detail/garbagedis0301detail.component';
import { Garbagedis0302Component } from './garbagedis0302/garbagedis0302.component';
import { Garbagedis0302detailComponent } from './garbagedis0302detail/garbagedis0302detail.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/common/pipes/pipe.module';

const routes: Routes = [
  { path: 'garbagedis001', component: Garbagedis001Component },
  { path: 'garbagedis002', component: Garbagedis002Component },
  { path: 'garbagedis003', component: Garbagedis003Component },
  { path: 'garbagedis001detail', component: Garbagedis001detailComponent },
  { path: 'garbagedis002detail', component: Garbagedis002detailComponent },
  { path: 'garbagedis0301detail', component: Garbagedis0301detailComponent },
  { path: 'garbagedis0302detail', component: Garbagedis0302detailComponent },
];

@NgModule({
  declarations: [
    Garbagedis001Component,
    Garbagedis001detailComponent,
    Garbagedis002Component,
    Garbagedis002detailComponent,
    Garbagedis003Component,
    Garbagedis0301Component,
    Garbagedis0301detailComponent,
    Garbagedis0302Component,

    Garbagedis0302detailComponent,

  ],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    PipeModule,
    FormsModule
  ],
  exports: [RouterModule],
})
export class GarbagedisModule { }
