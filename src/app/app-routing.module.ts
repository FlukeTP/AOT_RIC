import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { LoginComponent } from './page/baiwa/page/login/login.component';
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent },
  { path: '', loadChildren: './common/layout/layout.module#LayoutModule', canActivate: [AuthGuard] },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{ useHash: true }),
    ComponentsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
