import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { Category, EventPayload, EventStatus, Organisation, Registration } from '../../core/models';
import { FormatDatePipe } from '../../shared/format-date.pipe';

/** Image choices offered by the admin form: every P-* and AC-* asset in the library. */
const IMAGE_OPTIONS = [
  { value: 'P-01.jpg', label: 'P-01 - Street Dog First Response' },
  { value: 'P-05.jpg', label: 'P-05 - Shelter Intake Shift' },
  { value: 'P-06.jpg', label: 'P-06 - Kennel Enrichment Session' },
  { value: 'AC-01.jpg', label: 'AC-01 - Meet-and-Greet Adoption Hour' },
  { value: 'AC-02.jpg', label: 'AC-02 - Foster Care Orientation' },
  { value: 'AC-03.jpg', label: 'AC-03 - Adoption Guidance Clinic' },
  { value: 'AC-05.jpg', label: 'AC-05 - Emergency Dog Rescue Drill' },
  { value: 'AC-08.jpg', label: 'AC-08 - Foster Family Meetup' }
];

/** Service type choices offered by the admin form. */
const SERVICE_TYPES = [
  { value: 'rescue-support', label: 'Rescue Support' },
  { value: 'adoption-guidance', label: 'Adoption Guidance' },
  { value: 'foster-care', label: 'Foster Care' },
  { value: 'shelter-shift', label: 'Shelter Shift' }
];

type FieldName =
  | 'title'
  | 'categoryId'
  | 'organisationId'
  | 'date'
  | 'location'
  | 'status'
  | 'price'
  | 'latitude'
  | 'longitude'
  | 'image'
  | 'description'
  | 'purpose';

@Component({
    selector: 'app-admin-form',
    imports: [FormsModule, RouterLink, FormatDatePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './admin-form.component.html'
})
export class AdminFormComponent implements OnInit {
  categories: Category[] = [];
  organisations: Organisation[] = [];
  imageOptions = IMAGE_OPTIONS;
  serviceTypes = SERVICE_TYPES;

  eventId: string | null = null;
  isEdit = false;

  registrations: Registration[] = [];
  registrationsLoaded = false;

  model = {
    title: '',
    categoryId: '',
    organisationId: '',
    date: '',
    location: '',
    status: 'upcoming' as EventStatus,
    price: '',
    latitude: '',
    longitude: '',
    image: '',
    serviceType: '',
    description: '',
    purpose: ''
  };

  errors: Partial<Record<FieldName, string>> = {};

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('id');
    this.isEdit = !!this.eventId;
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadCategories();
    await this.loadOrganisations();

    if (this.isEdit && this.eventId) {
      await this.loadEvent(this.eventId);
      await this.loadRegistrations(this.eventId);
    }
  }

  async onSubmit(): Promise<void> {
    this.errors = {};

    if (!this.validate()) {
      return;
    }

    const payload: EventPayload = {
      title: this.model.title.trim(),
      categoryId: parseInt(this.model.categoryId, 10),
      organisationId: parseInt(this.model.organisationId, 10),
      date: this.model.date,
      location: this.model.location.trim(),
      status: this.model.status,
      price: this.model.price.trim(),
      image: this.model.image,
      serviceType: this.model.serviceType || null,
      description: this.model.description.trim(),
      purpose: this.model.purpose.trim(),
      latitude: String(this.model.latitude).trim() === '' ? null : Number(this.model.latitude),
      longitude: String(this.model.longitude).trim() === '' ? null : Number(this.model.longitude)
    };

    try {
      if (this.isEdit && this.eventId) {
        await this.api.updateEvent(this.eventId, payload);
        alert('Service updated successfully!');
      } else {
        await this.api.createEvent(payload);
        alert('Service created successfully!');
      }
      this.router.navigate(['/admin']);
    } catch (error) {
      console.error('Save failed:', error);
      alert(error instanceof Error && error.message ? error.message : 'Failed to save service. Please try again.');
    }
  }

  async onDelete(): Promise<void> {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    if (!this.eventId) return;

    try {
      await this.api.deleteEvent(this.eventId);
      alert('Service deleted.');
      this.router.navigate(['/admin']);
    } catch (error) {
      console.error('Delete failed:', error);
      const status = (error as { status?: number }).status;
      if (status === 409) {
        alert('This service cannot be deleted because it has registrations.');
      } else if (status === 404) {
        alert('This service no longer exists.');
        this.router.navigate(['/admin']);
      } else {
        alert('Failed to delete service.');
      }
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.api.getCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  private async loadOrganisations(): Promise<void> {
    try {
      this.organisations = await this.api.getOrganisations();
    } catch (error) {
      console.error('Failed to load organisations:', error);
    }
  }

  private async loadEvent(id: string): Promise<void> {
    try {
      const event = await this.api.getAdminEvent(id);

      this.model.title = event.title || '';
      this.model.categoryId = event.categoryId ? String(event.categoryId) : '';
      this.model.organisationId = event.organisationId ? String(event.organisationId) : '';
      this.model.date = event.date || '';
      this.model.location = event.location || '';
      this.model.status = event.status || 'upcoming';
      this.model.price = event.price || '';
      this.model.latitude = event.latitude != null ? String(event.latitude) : '';
      this.model.longitude = event.longitude != null ? String(event.longitude) : '';
      this.model.image = event.image || '';
      this.model.serviceType = event.serviceType || '';
      this.model.description = event.description || '';
      this.model.purpose = event.purpose || '';
    } catch (error) {
      console.error('Failed to load service:', error);
      alert('Failed to load service data.');
      this.router.navigate(['/admin']);
    }
  }

  /** Read-only list of registrations linked to the service being edited. */
  private async loadRegistrations(id: string): Promise<void> {
    try {
      this.registrations = await this.api.getEventRegistrations(id);
      this.registrationsLoaded = true;
    } catch (error) {
      console.error('Failed to load service registrations:', error);
      this.registrationsLoaded = false;
    }
  }

  /** Mirrors the original validateForm() rules and messages field by field. */
  private validate(): boolean {
    const fields: { name: FieldName; value: string; required: boolean; min?: number; max?: number }[] = [
      { name: 'title', value: this.model.title, required: true, min: 2, max: 60 },
      { name: 'categoryId', value: this.model.categoryId, required: true },
      { name: 'organisationId', value: this.model.organisationId, required: true },
      { name: 'date', value: this.model.date, required: true },
      { name: 'location', value: this.model.location, required: true, min: 2, max: 60 },
      { name: 'status', value: this.model.status, required: true },
      { name: 'price', value: this.model.price, required: true },
      { name: 'latitude', value: this.model.latitude, required: true },
      { name: 'longitude', value: this.model.longitude, required: true },
      { name: 'image', value: this.model.image, required: true },
      { name: 'description', value: this.model.description, required: true, max: 500 },
      { name: 'purpose', value: this.model.purpose, required: true, max: 500 }
    ];

    let valid = true;

    for (const field of fields) {
      // Numeric inputs (latitude/longitude) hand back a number, not a string.
      const value = String(field.value ?? '').trim();

      if (field.required && value.length === 0) {
        this.errors[field.name] = 'This field is required';
        valid = false;
        continue;
      }
      if (field.min !== undefined && value.length < field.min) {
        this.errors[field.name] = `Must be at least ${field.min} characters`;
        valid = false;
        continue;
      }
      if (field.max !== undefined && value.length > field.max) {
        this.errors[field.name] = `Must be at most ${field.max} characters`;
        valid = false;
      }
    }

    // Coordinates are required (weather lookup depends on them) and must sit
    // inside valid ranges so the forecast can resolve for the service location.
    const lat = Number(this.model.latitude);
    const lon = Number(this.model.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      this.errors.latitude = 'Latitude must be between -90 and 90';
      valid = false;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      this.errors.longitude = 'Longitude must be between -180 and 180';
      valid = false;
    }

    return valid;
  }
}
