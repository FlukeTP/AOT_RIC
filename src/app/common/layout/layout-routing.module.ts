import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { DashboardComponent } from 'src/app/page/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'home', component: DashboardComponent },
      { path: 'home/:id', component: DashboardComponent },
      { path: 'components', loadChildren: '../../page/baiwa/baiwa.module#BaiwaModule' },
      { path: 'electricity', loadChildren: '../../page/electricity/electricity.module#ElectricityModule' },
      { path: 'water', loadChildren: '../../page/water/water.module#WaterModule' },
      { path: 'phone', loadChildren: '../../page/phone/phone.module#PhoneModule' },
      { path: 'communi', loadChildren: '../../page/communi/communi.module#CommuniModule' },
      { path: 'it', loadChildren: '../../page/it/it.module#ItModule' },
      { path: 'heavyeqp', loadChildren: '../../page/heavyeqp/heavyeqp.module#HeavyeqpModule' },
      { path: 'firebrigade', loadChildren: '../../page/firebrigade/firebrigade.module#FirebrigadeModule' },
      { path: 'garbagedis', loadChildren: '../../page/garbagedis/garbagedis.module#GarbagedisModule' },
      { path: 'pos', loadChildren: '../../page/pos/pos.module#PosModule' },
      { path: 'generalinfo', loadChildren: '../../page/generalinfo/generalinfo.module#GeneralinfoModule' },
      { path: 'settings', loadChildren: '../../page/settings/settings.module#SettingsModule' },
      { path: 'user', loadChildren: '../../page/usermanagement/user.module#UserModule' },
      { path: 'posControl', loadChildren: '../../page/posControl/posControl.module#PosControlModule' },
      { path: 'cndn', loadChildren: '../../page/cndn/cndn.module#CndnModule' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
