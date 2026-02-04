import { Routes } from '@angular/router';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { OpenAccountComponent } from './components/open-account/open-account.component';
import { EventsViewerComponent } from './components/events-viewer/events-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/new', component: OpenAccountComponent },
  { path: 'accounts/:id', component: AccountDetailComponent },
  { path: 'events', component: EventsViewerComponent },
  { path: '**', redirectTo: 'accounts' }
];
