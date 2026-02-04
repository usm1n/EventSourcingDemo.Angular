import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { 
  AccountResponse, 
  EventLogResponse,
  DepositRequest,
  WithdrawRequest,
  AccountSummaryResponse
} from '../../models/account.models';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container" *ngIf="account">
      <a routerLink="/accounts" class="back-link">← Back to Accounts</a>

      <!-- Account Header -->
      <div class="account-header">
        <div>
          <h1>{{ account.accountHolderName }}</h1>
          <span class="account-id">Account ID: {{ account.id }}</span>
        </div>
        <div class="balance-card">
          <div class="balance-label">Current Balance</div>
          <div class="balance-amount" [class.negative]="account.balance < 0">
            {{ account.balance | currency }}
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span class="badge" [class.active]="!account.isClosed" [class.closed]="account.isClosed">
          {{ account.isClosed ? 'Closed' : 'Active' }}
        </span>
        <span class="meta">Opened: {{ account.openedAt | date:'medium' }}</span>
        <span class="meta" *ngIf="account.closedAt">Closed: {{ account.closedAt | date:'medium' }}</span>
        <span class="meta">Version: {{ account.version }}</span>
      </div>

      <!-- Actions Section -->
      <div class="actions-section" *ngIf="!account.isClosed">
        <h3>Account Actions</h3>
        <div class="action-cards">
          <!-- Deposit -->
          <div class="action-card">
            <h4>💰 Deposit</h4>
            <div class="form-row">
              <input type="number" [(ngModel)]="depositAmount" placeholder="Amount" min="0.01" step="0.01">
              <input type="text" [(ngModel)]="depositDesc" placeholder="Description">
            </div>
            <button class="btn btn-success" (click)="deposit()" [disabled]="!depositAmount">
              Deposit
            </button>
          </div>

          <!-- Withdraw -->
          <div class="action-card">
            <h4>💸 Withdraw</h4>
            <div class="form-row">
              <input type="number" [(ngModel)]="withdrawAmount" placeholder="Amount" min="0.01" step="0.01">
              <input type="text" [(ngModel)]="withdrawDesc" placeholder="Description">
            </div>
            <button class="btn btn-warning" (click)="withdraw()" [disabled]="!withdrawAmount">
              Withdraw
            </button>
          </div>

          <!-- Transfer -->
          <div class="action-card">
            <h4>🔄 Transfer</h4>
            <select [(ngModel)]="transferToAccount">
              <option value="">Select destination...</option>
              <option *ngFor="let acc of otherAccounts" [value]="acc.id">
                {{ acc.accountHolderName }} ({{ acc.balance | currency }})
              </option>
            </select>
            <div class="form-row">
              <input type="number" [(ngModel)]="transferAmount" placeholder="Amount" min="0.01" step="0.01">
              <input type="text" [(ngModel)]="transferDesc" placeholder="Description">
            </div>
            <button class="btn btn-primary" (click)="transfer()" 
                    [disabled]="!transferAmount || !transferToAccount">
              Transfer
            </button>
          </div>
        </div>
      </div>

      <!-- Time Travel Section - THE COOL PART! -->
      <div class="time-travel-section">
        <h3>⏰ Time Travel</h3>
        <p class="info">See what this account looked like at any point in time!</p>
        <div class="time-travel-controls">
          <input type="datetime-local" [(ngModel)]="timeTravelDate">
          <button class="btn btn-secondary" (click)="timeTravel()" [disabled]="!timeTravelDate">
            Go Back in Time
          </button>
          <button class="btn btn-outline" (click)="resetTimeTravel()" *ngIf="isTimeTraveling">
            Return to Present
          </button>
        </div>
        <div *ngIf="isTimeTraveling" class="time-travel-notice">
          📍 Viewing account as of {{ timeTravelDate | date:'medium' }}
        </div>
      </div>

      <!-- Transaction History -->
      <div class="transactions-section">
        <h3>Transaction History</h3>
        <div class="transactions-table" *ngIf="account.transactions.length > 0; else noTx">
          <div class="tx-header">
            <span>Date</span>
            <span>Type</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Balance</span>
          </div>
          <div class="tx-row" *ngFor="let tx of account.transactions">
            <span>{{ tx.date | date:'short' }}</span>
            <span class="tx-type" [class]="tx.type.toLowerCase()">{{ tx.type }}</span>
            <span>{{ tx.description }}</span>
            <span [class.deposit]="tx.type === 'Deposit'" [class.withdraw]="tx.type !== 'Deposit'">
              {{ tx.type === 'Deposit' ? '+' : '-' }}{{ tx.amount | currency }}
            </span>
            <span>{{ tx.balanceAfter | currency }}</span>
          </div>
        </div>
        <ng-template #noTx>
          <p class="empty">No transactions yet.</p>
        </ng-template>
      </div>

      <!-- Event Log - Raw Events -->
      <div class="events-section">
        <h3>📜 Event Log (Raw Events)</h3>
        <p class="info">These are the actual events stored in the event store.</p>
        <button class="btn btn-outline" (click)="loadEvents()" *ngIf="!showEvents">
          Show Event Log
        </button>
        <div class="events-list" *ngIf="showEvents">
          <div class="event-item" *ngFor="let event of events">
            <div class="event-header">
              <span class="event-type">{{ event.eventType }}</span>
              <span class="event-version">v{{ event.version }}</span>
              <span class="event-time">{{ event.occurredAt | date:'medium' }}</span>
            </div>
            <pre class="event-data">{{ event.eventData | json }}</pre>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .back-link { color: #4f46e5; text-decoration: none; display: inline-block; margin-bottom: 16px; }
    .back-link:hover { text-decoration: underline; }

    .account-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    h1 { margin: 0; color: #111; }
    .account-id { font-family: monospace; color: #6b7280; font-size: 14px; }

    .balance-card { background: #f0fdf4; padding: 16px 24px; border-radius: 12px; text-align: right; }
    .balance-label { font-size: 12px; color: #166534; text-transform: uppercase; }
    .balance-amount { font-size: 32px; font-weight: 700; color: #059669; }
    .balance-amount.negative { color: #dc2626; }

    .status-bar { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.closed { background: #fee2e2; color: #991b1b; }
    .meta { color: #6b7280; font-size: 13px; }

    .actions-section, .time-travel-section, .transactions-section, .events-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    h3 { margin: 0 0 16px 0; color: #111; }
    .info { color: #6b7280; font-size: 14px; margin-bottom: 16px; }

    .action-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .action-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
    .action-card h4 { margin: 0 0 12px 0; }
 .form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.form-row input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

    select { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 8px; }

    .btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-success { background: #059669; color: white; }
    .btn-warning { background: #d97706; color: white; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .time-travel-controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .time-travel-controls input { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }
    .time-travel-notice { margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 8px; color: #92400e; }

    .transactions-table { font-size: 14px; }
    .tx-header, .tx-row { display: grid; grid-template-columns: 1fr 100px 2fr 100px 100px; gap: 12px; padding: 12px 0; }
    .tx-header { font-weight: 600; border-bottom: 2px solid #e5e7eb; color: #374151; }
    .tx-row { border-bottom: 1px solid #f3f4f6; }
    .tx-type { padding: 2px 8px; border-radius: 4px; font-size: 12px; text-align: center; }
    .tx-type.deposit { background: #d1fae5; color: #065f46; }
    .tx-type.withdrawal { background: #fee2e2; color: #991b1b; }
    .tx-type.transfer { background: #dbeafe; color: #1e40af; }
    .deposit { color: #059669; }
    .withdraw { color: #dc2626; }
    .empty { color: #9ca3af; text-align: center; padding: 20px; }

    .events-list { margin-top: 16px; }
    .event-item { background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .event-header { display: flex; gap: 12px; margin-bottom: 8px; }
    .event-type { color: #34d399; font-weight: 600; }
    .event-version { color: #60a5fa; }
    .event-time { color: #9ca3af; font-size: 12px; margin-left: auto; }
    .event-data { color: #e5e7eb; font-size: 12px; margin: 0; overflow-x: auto; white-space: pre-wrap; }

    .error-message { margin-top: 16px; padding: 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; }
  `]
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);

  account: AccountResponse | null = null;
  events: EventLogResponse[] = [];
  otherAccounts: AccountSummaryResponse[] = [];
  showEvents = false;
  isTimeTraveling = false;
  error = '';

  // Form fields
  depositAmount = 0;
  depositDesc = '';
  withdrawAmount = 0;
  withdrawDesc = '';
  transferAmount = 0;
  transferDesc = '';
  transferToAccount = '';
  timeTravelDate = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
      this.loadOtherAccounts(id);
    }
  }

  loadAccount(id: string): void {
    this.accountService.getAccount(id).subscribe({
      next: (account) => this.account = account,
      error: (err) => this.error = err.error || 'Failed to load account'
    });
  }

  loadOtherAccounts(currentId: string): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.otherAccounts = accounts.filter(a => a.id !== currentId && !a.isClosed);
      }
    });
  }

  deposit(): void {
    if (!this.account) return;
    const request: DepositRequest = { amount: this.depositAmount, description: this.depositDesc || 'Deposit' };
    this.accountService.deposit(this.account.id, request).subscribe({
      next: (account) => {
        this.account = account;
        this.depositAmount = 0;
        this.depositDesc = '';
        this.error = '';
      },
      error: (err) => this.error = err.error || 'Deposit failed'
    });
  }

  withdraw(): void {
    if (!this.account) return;
    const request = { amount: this.withdrawAmount, description: this.withdrawDesc || 'Withdrawal' };
    this.accountService.withdraw(this.account.id, request).subscribe({
      next: (account) => {
        this.account = account;
        this.withdrawAmount = 0;
        this.withdrawDesc = '';
        this.error = '';
      },
      error: (err) => this.error = err.error || 'Withdrawal failed'
    });
  }

  transfer(): void {
    if (!this.account) return;
    const request = { 
      toAccountId: this.transferToAccount, 
      amount: this.transferAmount, 
      description: this.transferDesc || 'Transfer' 
    };
    this.accountService.transfer(this.account.id, request).subscribe({
      next: (account) => {
        this.account = account;
        this.transferAmount = 0;
        this.transferDesc = '';
        this.transferToAccount = '';
        this.error = '';
      },
      error: (err) => this.error = err.error || 'Transfer failed'
    });
  }

  timeTravel(): void {
    if (!this.account || !this.timeTravelDate) return;
    const isoDate = new Date(this.timeTravelDate).toISOString();
    this.accountService.timeTravelAccount(this.account.id, { pointInTime: isoDate }).subscribe({
      next: (account) => {
        this.account = account;
        this.isTimeTraveling = true;
        this.error = '';
      },
      error: (err) => this.error = err.error || 'Time travel failed'
    });
  }

  resetTimeTravel(): void {
    if (!this.account) return;
    this.isTimeTraveling = false;
    this.timeTravelDate = '';
    this.loadAccount(this.account.id);
  }

  loadEvents(): void {
    if (!this.account) return;
    this.accountService.getAccountEvents(this.account.id).subscribe({
      next: (events) => {
        this.events = events;
        this.showEvents = true;
      },
      error: (err) => this.error = err.error || 'Failed to load events'
    });
  }
}
