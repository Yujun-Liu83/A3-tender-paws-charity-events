import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { EventDetail, Registration } from '../../core/models';
import { FormatDatePipe } from '../../shared/format-date.pipe';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
    selector: 'app-admin-registrations',
    imports: [RouterLink, FormatDatePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './admin-registrations.component.html'
})
export class AdminRegistrationsComponent implements OnInit {
  eventId: string | null = null;
  event: EventDetail | null = null;
  registrations: Registration[] = [];

  state: LoadState = 'loading';
  errorMessage = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('id');

    if (!this.eventId) {
      this.state = 'error';
      this.errorMessage = 'No service specified.';
      return;
    }

    this.load();
  }

  /** Pet experience is stored lower case; the table shows it capitalised. */
  petExperienceLabel(registration: Registration): string {
    const value = registration.petExperience;
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '—';
  }

  private async load(): Promise<void> {
    if (!this.eventId) return;

    try {
      this.event = await this.api.getEvent(this.eventId);
      const registrations = await this.api.getEventRegistrations(this.eventId);
      this.registrations = registrations;
      this.state = registrations.length === 0 ? 'empty' : 'ready';
    } catch (error) {
      console.error('Failed to load registrations:', error);
      this.state = 'error';
    }
  }

  /** Same CSV layout, quoting and filename as the original export. */
  async exportToCsv(): Promise<void> {
    if (!this.eventId) return;

    try {
      const registrations = await this.api.getEventRegistrations(this.eventId);
      const event = await this.api.getEvent(this.eventId);

      const headers = ['ID', 'Name', 'Email', 'Phone', 'Places', 'Pet Experience', 'Pet Types', 'Registered At'];
      const rows = registrations.map(reg => [
        reg.id,
        reg.name,
        reg.email,
        reg.phone,
        reg.quantity,
        reg.petExperience || '',
        reg.petTypes || '',
        reg.registeredAt
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `registrations-${event.title.replace(/\s+/g, '-')}-${this.eventId}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export registrations.');
    }
  }
}
