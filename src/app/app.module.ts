import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BlockUiService } from './common/block-ui/block-ui.service';
import { ComponentsModule } from './components/components.module';
import { LoginComponent } from './page/baiwa/page/login/login.component';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AjaxService } from './_service/ajax.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { PipeModule } from './common/pipes/pipe.module';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ValidateService } from './_service/validate.service';
import { UserService } from './_service/user.service.';
import { DropdownOrListService } from './_service/dropdown-list.service';
import { CnDnService } from './_service/cn-dn.serviec';

@NgModule({

  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    ModalModule.forRoot(),
    PipeModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    LoginComponent
  ],
  providers: [
    AjaxService,
    BlockUiService,
    ValidateService,
    UserService,
    BsModalRef,
    DatePipe,
    DropdownOrListService,
    CnDnService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
