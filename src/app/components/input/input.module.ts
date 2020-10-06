import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputCalendarComponent } from './input-calendar/input-calendar.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
@NgModule({

  imports: [
    CommonModule,
    BsDatepickerModule.forRoot()
  ],
  declarations: [
    InputCalendarComponent,
  ],
  exports: [
    InputCalendarComponent,
  ],

})
export class InputModule { }
