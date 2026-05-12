import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout';

import { StudySpaceComponent } from './pages/study-space/study-space';

import { UsersComponent } from './pages/users/users';

import { UserDetailsComponent } from './pages/user-details/user-details';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,

    children: [
      {
        path: '',
        component: StudySpaceComponent,
        data: { section: 'dashboard' },
      },

      {
        path: 'planning',
        component: StudySpaceComponent,
        data: { section: 'planning' },
      },

      {
        path: 'productivity',
        component: StudySpaceComponent,
        data: { section: 'productivity' },
      },

      {
        path: 'goals',
        component: StudySpaceComponent,
        data: { section: 'goals' },
      },

      {
        path: 'groups',
        component: StudySpaceComponent,
        data: { section: 'groups' },
      },

      {
        path: 'messages',
        component: StudySpaceComponent,
        data: { section: 'messages' },
      },

      {
        path: 'notifications',
        component: StudySpaceComponent,
        data: { section: 'notifications' },
      },

      {
        path: 'users',
        component: UsersComponent,
      },

      {
        path: 'users/:id',
        component: UserDetailsComponent,
      },

      {
        path: 'profile',
        component: StudySpaceComponent,
        data: { section: 'profile' },
      },

      {
        path: 'settings',
        component: StudySpaceComponent,
        data: { section: 'settings' },
      },
    ],
  },
];
