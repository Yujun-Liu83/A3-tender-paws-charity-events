import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { EventSummary } from '../../core/models';
import { EventCardComponent } from '../../shared/event-card.component';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
    selector: 'app-home',
    imports: [RouterLink, EventCardComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  state: LoadState = 'loading';
  events: EventSummary[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      const events = await this.api.getFeaturedEvents();
      this.events = events;
      this.state = events.length ? 'ready' : 'empty';
    } catch (error) {
      console.error('Failed to load services:', error);
      this.state = 'error';
    }
  }
}
