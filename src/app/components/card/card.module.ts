import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardHeaderComponent } from './card-header/card-header.component';
import { RouterModule } from '@angular/router';

@NgModule({
  
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    CardHeaderComponent,
  ],
  exports: [
    CardHeaderComponent,
  ]
})
export class CardModule { }
