import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { AlertService } from './alert.service';
@NgModule({
  declarations: [AlertComponent],
  imports: [
    CommonModule
  ],
  providers:[AlertService]
})
export class NotificationModule { }
