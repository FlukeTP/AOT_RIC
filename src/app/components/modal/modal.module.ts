import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfirmComponent } from './modal-confirm/modalConfirm.component';
import { ButtonModule } from '..';
import { ModalAlertComponent } from './modal-alert/modalAlert.component';
import { ModalSuccessComponent } from './modal-success/modalSuccess.component';
import { ModalErrorComponent } from './modal-error/modalError.component';
import { ModalCustomComponent } from './modal-custom/modalCustom.component';
import { ModalComponent } from './modal-normal/modal.component';
import { ModalLookupComponent } from './modal-lookup/modalLookup.component';
import { DataTablesModule } from 'angular-datatables';
@NgModule({
  declarations: [
    ModalComponent,
    ModalConfirmComponent,
    ModalAlertComponent,
    ModalSuccessComponent,
    ModalErrorComponent,
    ModalCustomComponent,
    ModalLookupComponent
  ],
  imports: [
    CommonModule
    ,ButtonModule
    ,DataTablesModule
  ],
  exports: [
    ModalComponent,
    ModalConfirmComponent,
    ModalAlertComponent,
    ModalSuccessComponent,
    ModalErrorComponent,
    ModalCustomComponent,
    ModalLookupComponent
  ]
})
export class ModalModule { }