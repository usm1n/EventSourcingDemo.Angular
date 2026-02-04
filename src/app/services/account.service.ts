import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountResponse,
  AccountSummaryResponse,
  OpenAccountRequest,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  CloseAccountRequest,
  TimeTravelRequest,
  EventLogResponse
} from '../models/account.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/accounts`;

  // Get all accounts
  getAllAccounts(): Observable<AccountSummaryResponse[]> {
    return this.http.get<AccountSummaryResponse[]>(this.baseUrl);
  }

  // Get single account with full details
  getAccount(id: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.baseUrl}/${id}`);
  }

  // Open new account
  openAccount(request: OpenAccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.baseUrl, request);
  }

  // Deposit money
  deposit(accountId: string, request: DepositRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${accountId}/deposit`, request);
  }

  // Withdraw money
  withdraw(accountId: string, request: WithdrawRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${accountId}/withdraw`, request);
  }

  // Transfer money
  transfer(accountId: string, request: TransferRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${accountId}/transfer`, request);
  }

  // Close account
  closeAccount(accountId: string, request: CloseAccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${accountId}/close`, request);
  }

  // TIME TRAVEL - Get account at specific point in time
  timeTravelAccount(accountId: string, request: TimeTravelRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${accountId}/time-travel`, request);
  }

  // Get event log for account
  getAccountEvents(accountId: string): Observable<EventLogResponse[]> {
    return this.http.get<EventLogResponse[]>(`${this.baseUrl}/${accountId}/events`);
  }

  // Get all events in system
  getAllEvents(): Observable<EventLogResponse[]> {
    return this.http.get<EventLogResponse[]>(`${this.baseUrl}/all-events`);
  }
}
