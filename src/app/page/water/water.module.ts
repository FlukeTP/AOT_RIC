import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { Water001Component } from './water001/water001.component';
import { Water001detailComponent } from './water001detail/water001detail.component';
import { Water002Component } from './water002/water002.component';
import { Water002detailComponent } from './water002detail/water002detail.component';
import { Water003Component } from './water003/water003.component';
import { Water003detailComponent } from './water003detail/water003detail.component';
import { Water004Component } from './water004/water004.component';
import { Water004detailComponent } from './water004detail/water004detail.component';
import { Water005Component } from './water005/water005.component';
import { Water005detailComponent } from './water005detail/water005detail.component';
import { Water006Component } from './water006/water006.component';
import { Water006detailComponent } from './water006detail/water006detail.component';
import { Water007Component } from './water007/water007.component';
import { Water007detailComponent } from './water007detail/water007detail.component';
import { Water008Component } from './water008/water008.component';
import { Water008detailComponent } from './water008detail/water008detail.component';
import { Water009Component } from './water009/water009.component';
import { Water009detailComponent } from './water009detail/water009detail.component';
import { Water010Component } from './water010/water010.component';
import { Water0101Component } from './water0101/water0101.component';
import { water0102Component } from './water0102/water0102.component';
import { Water011Component } from './water011/water011.component';
import { Water0111Component } from './water0111/water0111.component';
import { Water0112Component } from './water0112/water0112.component';
import { Water0113Component } from './water0113/water0113.component';
import { Water0114Component } from './water0114/water0114.component';
import { Water0101detailComponent } from './water0101detail/water0101detail.component';
import { Water0111detailComponent } from './water0111detail/water0111detail.component';
import { Water0112detailComponent } from './water0112detail/water0112detail.component';
import { Water0102detailComponent } from './water0102detail/water0102detail.component';
import { Water0113detailComponent } from './water0113detail/water0113detail.component';
import { Water0114detailComponent } from './water0114detail/water0114detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
const routes: Routes = [
  { path: '', redirectTo: '/home/water' , pathMatch: 'full' },
  { path: 'water001', component: Water001Component },
  { path: 'water001detail', component: Water001detailComponent },
  { path: 'water002', component: Water002Component },
  { path: 'water002detail', component: Water002detailComponent },
  { path: 'water003', component: Water003Component },
  { path: 'water003detail', component: Water003detailComponent },
  { path: 'water004', component: Water004Component },
  { path: 'water004detail', component: Water004detailComponent },
  { path: 'water005', component: Water005Component },
  { path: 'water005detail', component: Water005detailComponent },
  { path: 'water006', component: Water006Component },
  { path: 'water006detail', component: Water006detailComponent },
  { path: 'water007', component: Water007Component },
  { path: 'water007detail', component: Water007detailComponent },
  { path: 'water008', component: Water008Component },
  { path: 'water008detail', component: Water008detailComponent },
  { path: 'water009', component: Water009Component },
  { path: 'water009detail', component: Water009detailComponent },
  { path: 'water010', component: Water010Component },
  { path: 'water0101detail', component: Water0101detailComponent },
  { path: 'water0102detail', component: Water0102detailComponent },
  { path: 'water0111detail', component: Water0111detailComponent },
  { path: 'water0112detail', component: Water0112detailComponent },
  { path: 'water0113detail', component: Water0113detailComponent },
  { path: 'water0114detail', component: Water0114detailComponent },
  { path: 'water011', component: Water011Component },

];

@NgModule({
  declarations: [
    Water001Component,
    Water001detailComponent,
    Water002Component,
    Water002detailComponent,
    Water003Component,
    Water003detailComponent,
    Water004Component,
    Water004detailComponent,
    Water005Component,
    Water005detailComponent,
    Water006Component,
    Water006detailComponent,
    Water007Component,
    Water007detailComponent,
    Water008Component,
    Water008detailComponent,
    Water009Component,
    Water009detailComponent,
    Water010Component,
    Water0101Component,
    water0102Component,
    Water0101detailComponent,
    Water0102detailComponent,
    Water011Component,
    Water0111Component,
    Water0112Component,
    Water0113Component,
    Water0114Component,
    Water0111detailComponent,
    Water0112detailComponent,
    Water0113detailComponent,
    Water0114detailComponent,

  ],
  imports: [
    CommonModule,
    ComponentsModule,
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    PipeModule,
    TypeaheadModule.forRoot()
  ],
  exports: [RouterModule],
})
export class WaterModule { }
