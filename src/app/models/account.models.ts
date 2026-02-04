// Request models
export interface OpenAccountRequest {
  accountHolderName: string;
  initialDeposit: number;
}

export interface DepositRequest {
  amount: number;
  description: string;
}

export interface WithdrawRequest {
  amount: number;
  description: string;
}

export interface TransferRequest {
  toAccountId: string;
  amount: number;
  description: string;
}

export interface CloseAccountRequest {
  reason: string;
}

export interface TimeTravelRequest {
  pointInTime: string; // ISO date string
}

// Response models
export interface AccountResponse {
  id: string;
  accountHolderName: string;
  balance: number;
  isClosed: boolean;
  openedAt: string;
  closedAt: string | null;
  version: number;
  transactions: TransactionResponse[];
}

export interface TransactionResponse {
  date: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
}

export interface AccountSummaryResponse {
  id: string;
  accountHolderName: string;
  balance: number;
  isClosed: boolean;
}

export interface EventLogResponse {
  sequenceNumber: number;
  eventId: string;
  aggregateId: string;
  eventType: string;
  eventData: string;
  version: number;
  occurredAt: string;
}
