import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PipeModule } from 'src/app/common/pipes/pipe.module';

import { It001Component } from './it001/it001.component';
import { It002Component } from './it002/it002.component';
import { It003Component } from './it003/it003.component';
import { It004Component } from './it004/it004.component';
import { It005Component } from './it005/it005.component';
import { It006Component } from './it006/it006.component';
import { It007Component } from './it007/it007.component';
import { It008Component } from './it008/it008.component';
import { It009Component } from './it009/it009.component';
import { It001detailComponent } from './it001detail/it001detail.component';
import { It002detailComponent } from './it002detail/it002detail.component';
import { It003detailComponent } from './it003detail/it003detail.component';
import { It004detailComponent } from './it004detail/it004detail.component';
import { It005detailComponent } from './it005detail/it005detail.component';
import { It006detailComponent } from './it006detail/it006detail.component';
import { It007detailComponent } from './it007detail/it007detail.component';
import { It008detailComponent } from './it008detail/it008detail.component';
import { It009detailComponent } from './it009detail/it009detail.component';
import { It010Component } from './it010/it010.component';
import { It0101Component } from './it0101/it0101.component';
import { It0101detailComponent } from './it0101detail/it0101detail.component';
import { It0102Component } from './it0102/it0102.component';
import { It0102detailComponent } from './it0102detail/it0102detail.component';
import { It0103Component } from './it0103/it0103.component';
import { It0103detailComponent } from './it0103detail/it0103detail.component';
import { It0104Component } from './it0104/it0104.component';
import { It0104detailComponent } from './it0104detail/it0104detail.component';
import { It0105Component } from './it0105/it0105.component';
import { It0105detailComponent } from './it0105detail/it0105detail.component';
import { It011Component } from './it011/it011.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ColorPickerModule } from 'ngx-color-picker';

const routes: Routes = [
  { path: 'it001', component: It001Component },
  { path: 'it002', component: It002Component },
  { path: 'it003', component: It003Component },
  { path: 'it004', component: It004Component },
  { path: 'it005', component: It005Component },
  { path: 'it006', component: It006Component },
  { path: 'it007', component: It007Component },
  { path: 'it008', component: It008Component },
  { path: 'it009', component: It009Component },
  { path: 'it010', component: It010Component },
  { path: 'it011', component: It011Component },
  { path: 'it001detail', component: It001detailComponent },
  { path: 'it002detail', component: It002detailComponent },
  { path: 'it003detail', component: It003detailComponent },
  { path: 'it004detail', component: It004detailComponent },
  { path: 'it005detail', component: It005detailComponent },
  { path: 'it006detail', component: It006detailComponent },
  { path: 'it007detail', component: It007detailComponent },
  { path: 'it008detail', component: It008detailComponent },
  { path: 'it009detail', component: It009detailComponent },
  { path: 'it0101detail', component: It0101detailComponent },
  { path: 'it0102detail', component: It0102detailComponent },
  { path: 'it0103detail', component: It0103detailComponent },
  { path: 'it0104detail', component: It0104detailComponent },
  { path: 'it0105detail', component: It0105detailComponent },
];

@NgModule({
  declarations: [
    It001Component,
    It001detailComponent,
    It002Component,
    It002detailComponent,
    It003Component,
    It003detailComponent,
    It004Component,
    It004detailComponent,
    It005Component,
    It005detailComponent,
    It006Component,
    It006detailComponent,
    It007Component,
    It007detailComponent,
    It008Component,
    It008detailComponent,
    It009Component,
    It009detailComponent,
    It010Component,
    It0101Component,
    It0101detailComponent,
    It0102Component,
    It0102detailComponent,
    It0103Component,
    It0103detailComponent,
    It0104Component,
    It0104detailComponent,
    It0105Component,
    It0105detailComponent,
    It011Component],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    PipeModule,
    FullCalendarModule,
    ColorPickerModule
  ],
  exports: [RouterModule],
})
export class ItModule { }
