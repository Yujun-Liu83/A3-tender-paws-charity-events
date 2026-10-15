import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';

import { ApiError, ApiService } from '../../core/api.service';
import { EventSummary } from '../../core/models';
import { FormatDatePipe } from '../../shared/format-date.pipe';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

/** Admin list status is derived from the stored status plus the service date. */
type AdminStatus = { label: string; cls: string };

@Component({
    selector: 'app-admin-list',
    imports: [FormsModule, RouterLink, FormatDatePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './admin-list.component.html'
})
export class AdminListComponent implements OnInit, OnDestroy {
  events: EventSummary[] = [];
  status = '';
  search = '';
  state: LoadState = 'loading';

  /** The search box debounces at 300ms; the status select reloads at once. */
  private searchChanged = new Subject<void>();
  private subscriptions = new Subscription();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.subscriptions.add(this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.loadEvents()));
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onStatusChange(): void {
    this.loadEvents();
  }

  onSearchChange(): void {
    this.searchChanged.next();
  }

  /** Admin lists use Active / Past / Suspended, derived from status and date. */
  displayStatus(event: EventSummary): AdminStatus {
    if (event.status === 'suspended') {
      return { label: 'Suspended', cls: 'status-suspended' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);

    if (!isNaN(eventDate.getTime()) && eventDate < today) {
      return { label: 'Past', cls: 'status-past' };
    }

    return { label: 'Active', cls: 'status-active' };
  }

  async handleDelete(event: EventSummary): Promise<void> {
    if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) {
      return;
    }

    try {
      await this.api.deleteEvent(event.id);
      await this.loadEvents();
    } catch (error) {
      console.error('Delete failed:', error);
      if (error instanceof ApiError && error.status === 409) {
        alert('This service cannot be deleted because it has registrations. Review the registrations first.');
      } else if (error instanceof ApiError && error.status === 404) {
        alert('This service no longer exists.');
        await this.loadEvents();
      } else {
        alert('Failed to delete service. Please try again.');
      }
    }
  }

  private async loadEvents(): Promise<void> {
    this.state = 'loading';

    try {
      const events = await this.api.getAdminEvents({ status: this.status, q: this.search });
      this.events = events;
      this.state = events.length === 0 ? 'empty' : 'ready';
    } catch (error) {
      console.error('Failed to load services:', error);
      this.state = 'error';
    }
  }
}
