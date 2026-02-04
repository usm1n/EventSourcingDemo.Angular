import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { OpenAccountRequest } from '../../models/account.models';

@Component({
  selector: 'app-open-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="form-card">
        <h2>Open New Account</h2>
        <p class="subtitle">Create a new bank account with an optional initial deposit.</p>

        <form (ngSubmit)="onSubmit()" #accountForm="ngForm">
          <div class="form-group">
            <label for="name">Account Holder Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              [(ngModel)]="request.accountHolderName"
              required
              placeholder="Enter full name"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="deposit">Initial Deposit (optional)</label>
            <input 
              type="number" 
              id="deposit" 
              name="deposit"
              [(ngModel)]="request.initialDeposit"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="form-control">
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/accounts">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!accountForm.valid || loading">
              {{ loading ? 'Creating...' : 'Open Account' }}
            </button>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="info-box">
          <strong>💡 Event Sourcing Note:</strong>
          <p>When you open an account, an <code>AccountOpened</code> event is stored. 
          The account state is derived from this event.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 500px; margin: 0 auto; }
    
    .form-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
    }
    
    h2 { margin: 0 0 8px 0; color: #111; }
    .subtitle { color: #6b7280; margin-bottom: 24px; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      box-sizing: border-box;
    }
    .form-control:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    
    .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover:not(:disabled) { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    
    .error-message { margin-top: 16px; padding: 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; }
    
    .info-box {
      margin-top: 24px;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-box strong { color: #1e40af; }
    .info-box p { margin: 8px 0 0 0; color: #1e3a5f; font-size: 14px; }
    .info-box code { background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  `]
})
export class OpenAccountComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);

  request: OpenAccountRequest = {
    accountHolderName: '',
    initialDeposit: 0
  };

  loading = false;
  error = '';

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.accountService.openAccount(this.request).subscribe({
      next: (account) => {
        this.router.navigate(['/accounts', account.id]);
      },
      error: (err) => {
        this.error = err.error || 'Failed to open account';
        this.loading = false;
      }
    });
  }
}
