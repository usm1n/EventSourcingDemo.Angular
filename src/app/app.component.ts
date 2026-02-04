import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="logo" routerLink="/accounts">
          <span class="logo-icon">🏦</span>
          <span class="logo-text">Event Sourcing Demo</span>
        </div>
        <nav>
          <a routerLink="/accounts" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Accounts
          </a>
          <a routerLink="/events" routerLinkActive="active">
            Event Store
          </a>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
      <footer>
        <p>
          Built with .NET 9 + Angular 19 | 
          <strong>Event Sourcing Pattern Demo</strong>
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f3f4f6;
    }
    
    .app-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 20px; font-weight: 600; color: #111; }
    
    nav {
      display: flex;
      gap: 8px;
    }
    nav a {
      padding: 8px 16px;
      border-radius: 8px;
      color: #6b7280;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    nav a:hover { background: #f3f4f6; color: #111; }
    nav a.active { background: #4f46e5; color: white; }
    
    main {
      flex: 1;
      padding: 24px;
    }
    
    footer {
      text-align: center;
      padding: 16px;
      color: #9ca3af;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }
    footer strong { color: #4f46e5; }
  `]
})
export class AppComponent {
  title = 'Event Sourcing Demo';
}
