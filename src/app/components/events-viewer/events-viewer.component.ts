import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { EventLogResponse } from '../../models/account.models';

@Component({
  selector: 'app-events-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <a routerLink="/accounts" class="back-link">← Back to Accounts</a>
      
      <div class="header">
        <h1>📜 Event Store</h1>
        <p>This is the raw event log - the source of truth in event sourcing.</p>
      </div>

      <div class="info-box">
        <strong>How Event Sourcing Works:</strong>
        <ul>
          <li>Every change is stored as an immutable event</li>
          <li>Events are never modified or deleted</li>
          <li>Current state is rebuilt by replaying events</li>
          <li>You can "time travel" to any point in history</li>
        </ul>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ events.length }}</span>
          <span class="stat-label">Total Events</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ uniqueAggregates }}</span>
          <span class="stat-label">Accounts</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ eventTypes.length }}</span>
          <span class="stat-label">Event Types</span>
        </div>
      </div>

      <div class="events-timeline">
        <div class="timeline-item" *ngFor="let event of events">
          <div class="timeline-marker">
            <span class="sequence">{{ event.sequenceNumber }}</span>
          </div>
          <div class="timeline-content">
            <div class="event-card">
              <div class="event-header">
                <span class="event-type" [class]="getEventClass(event.eventType)">
                  {{ event.eventType }}
                </span>
                <span class="event-meta">
                  v{{ event.version }} • {{ event.occurredAt | date:'medium' }}
                </span>
              </div>
              <div class="aggregate-info">
                Aggregate: <a [routerLink]="['/accounts', event.aggregateId]">{{ event.aggregateId | slice:0:8 }}...</a>
              </div>
              <div class="event-data">
                <pre>{{ formatEventData(event.eventData) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="events.length === 0" class="empty-state">
        <p>No events yet. Open an account to see events appear here!</p>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .back-link { color: #4f46e5; text-decoration: none; display: inline-block; margin-bottom: 16px; }
    
    .header { margin-bottom: 24px; }
    h1 { margin: 0 0 8px 0; }
    .header p { color: #6b7280; margin: 0; }
    
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .info-box strong { color: #1e40af; }
    .info-box ul { margin: 8px 0 0 0; padding-left: 20px; color: #1e3a5f; }
    .info-box li { margin: 4px 0; }
    
    .stats { display: flex; gap: 24px; margin-bottom: 32px; }
    .stat { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 32px; text-align: center; }
    .stat-value { display: block; font-size: 32px; font-weight: 700; color: #4f46e5; }
    .stat-label { color: #6b7280; font-size: 14px; }
    
    .events-timeline { position: relative; padding-left: 60px; }
    .events-timeline::before {
      content: '';
      position: absolute;
      left: 24px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }
    
    .timeline-item { position: relative; margin-bottom: 20px; }
    .timeline-marker {
      position: absolute;
      left: -60px;
      width: 48px;
      height: 48px;
      background: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    .sequence { color: white; font-weight: 600; font-size: 14px; }
    
    .event-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px 20px;
    }
    .event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .event-type {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .event-type.account { background: #dbeafe; color: #1e40af; }
    .event-type.deposit { background: #d1fae5; color: #065f46; }
    .event-type.withdraw { background: #fee2e2; color: #991b1b; }
    .event-type.transfer { background: #fef3c7; color: #92400e; }
    .event-type.close { background: #f3f4f6; color: #374151; }
    
    .event-meta { color: #9ca3af; font-size: 12px; }
    .aggregate-info { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    .aggregate-info a { color: #4f46e5; }
    
    .event-data { background: #1f2937; border-radius: 8px; padding: 12px; overflow-x: auto; }
    .event-data pre { margin: 0; color: #e5e7eb; font-size: 12px; white-space: pre-wrap; }
    
    .empty-state { text-align: center; padding: 60px; color: #6b7280; }
  `]
})
export class EventsViewerComponent implements OnInit {
  private accountService = inject(AccountService);
  events: EventLogResponse[] = [];

  get uniqueAggregates(): number {
    return new Set(this.events.map(e => e.aggregateId)).size;
  }

  get eventTypes(): string[] {
    return [...new Set(this.events.map(e => e.eventType))];
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.accountService.getAllEvents().subscribe({
      next: (events) => this.events = events,
      error: (err) => console.error('Failed to load events', err)
    });
  }

  getEventClass(eventType: string): string {
    if (eventType.includes('Opened')) return 'account';
    if (eventType.includes('Deposited')) return 'deposit';
    if (eventType.includes('Withdrawn')) return 'withdraw';
    if (eventType.includes('Transferred')) return 'transfer';
    if (eventType.includes('Closed')) return 'close';
    return '';
  }

  formatEventData(data: string): string {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }
}
