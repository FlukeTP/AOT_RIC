import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from 'src/app/components/components.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserComponent } from './user/user.component';
import { UserDetailComponent } from './userDetail/userDetail.component';
import { OrganizeComponent } from './organize/organize.component';
import { OrganizeAddComponent } from './organize-add/organize-add.component';
import { RoleComponent } from './role/role.component';
import { RoleDetailComponent } from './roleDetail/roleDetail.component';


const routes: Routes = [
  { path: 'user', component: UserComponent },
  { path: 'userDetail', component: UserDetailComponent },
  { path: 'organize', component: OrganizeComponent },
  { path: 'organize-add', component: OrganizeAddComponent },
  { path: 'role', component: RoleComponent },
  { path: 'roleDetail', component: RoleDetailComponent },
];

@NgModule({
  declarations: [
    UserComponent,
    UserDetailComponent,
    OrganizeComponent,
    OrganizeAddComponent,
    RoleComponent,
    RoleDetailComponent,

  ],
  imports: [
    CommonModule,    
    ComponentsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule],  
})
export class UserModule { }
