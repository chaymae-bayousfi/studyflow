import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { LoginPageComponent } from './pages/login-page/login-page';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { PlanningPageComponent } from './pages/planning-page/planning-page';
import { ProductivityPageComponent } from './pages/productivity-page/productivity-page';
import { GoalsPageComponent } from './pages/goals-page/goals-page';
import { GroupsPageComponent } from './pages/groups-page/groups-page';
import { MessagesPageComponent } from './pages/messages-page/messages-page';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page';
import { ProfilePageComponent } from './pages/profile-page/profile-page';
import { SettingsPageComponent } from './pages/settings-page/settings-page';
import { UsersComponent } from './pages/users/users';
import { UserDetailsComponent } from './pages/user-details/user-details';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardPageComponent },
      { path: 'planning', component: PlanningPageComponent },
      { path: 'productivity', component: ProductivityPageComponent },
      { path: 'goals', component: GoalsPageComponent },
      { path: 'groups', component: GroupsPageComponent },
      { path: 'messages', component: MessagesPageComponent },
      { path: 'notifications', component: NotificationsPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/:id', component: UserDetailsComponent },
    ],
  },
];
