import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AccountSummaryResponse } from '../../models/account.models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Bank Accounts</h2>
        <button class="btn btn-primary" routerLink="/accounts/new">
          + Open New Account
        </button>
      </div>

      <div class="accounts-grid" *ngIf="accounts.length > 0; else noAccounts">
        <div 
          *ngFor="let account of accounts" 
          class="account-card"
          [class.closed]="account.isClosed"
          [routerLink]="['/accounts', account.id]">
          <div class="account-name">{{ account.accountHolderName }}</div>
          <div class="account-balance" [class.negative]="account.balance < 0">
            {{ account.balance | currency }}
          </div>
          <div class="account-status">
            <span *ngIf="account.isClosed" class="badge closed">Closed</span>
            <span *ngIf="!account.isClosed" class="badge active">Active</span>
          </div>
          <div class="account-id">{{ account.id | slice:0:8 }}...</div>
        </div>
      </div>

      <ng-template #noAccounts>
        <div class="empty-state">
          <p>No accounts yet. Open your first account!</p>
        </div>
      </ng-template>

      <div class="event-log-link">
        <a routerLink="/events">View All Events (Event Store)</a>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; color: #333; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    
    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    
    .account-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .account-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .account-card.closed { opacity: 0.7; background: #f9fafb; }
    
    .account-name { font-size: 18px; font-weight: 600; color: #111; margin-bottom: 8px; }
    .account-balance { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 12px; }
    .account-balance.negative { color: #dc2626; }
    
    .badge { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-size: 12px; 
      font-weight: 500; 
    }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.closed { background: #fee2e2; color: #991b1b; }
    
    .account-id { margin-top: 12px; font-size: 12px; color: #9ca3af; font-family: monospace; }
    
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    
    .event-log-link { margin-top: 32px; text-align: center; }
    .event-log-link a { color: #4f46e5; text-decoration: none; }
    .event-log-link a:hover { text-decoration: underline; }
  `]
})
export class AccountListComponent implements OnInit {
  private accountService = inject(AccountService);
  accounts: AccountSummaryResponse[] = [];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => this.accounts = accounts,
      error: (err) => console.error('Failed to load accounts', err)
    });
  }
}
