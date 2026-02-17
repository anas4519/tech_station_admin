import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Devices } from './pages/devices/devices';
import { DeviceForm } from './pages/device-form/device-form';
import { Categories } from './pages/categories/categories';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'devices', component: Devices },
      { path: 'devices/new', component: DeviceForm },
      { path: 'devices/edit/:id', component: DeviceForm },
      { path: 'categories', component: Categories },
    ],
  },
];
