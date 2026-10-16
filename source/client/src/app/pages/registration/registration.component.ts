import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiError, ApiService } from '../../core/api.service';
import { EventDetail } from '../../core/models';
import { FormatDatePipe } from '../../shared/format-date.pipe';

type LoadState = 'loading' | 'ready' | 'error';

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  quantity: string;
  petExperience: string;
  petTypes: string[];
}

@Component({
    selector: 'app-registration',
    imports: [FormsModule, RouterLink, FormatDatePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {
  @ViewChild('errorBox') errorBox?: ElementRef<HTMLElement>;

  state: LoadState = 'loading';
  summaryError = '';
  event: EventDetail | null = null;

  form: RegistrationForm = {
    name: '',
    email: '',
    phone: '',
    quantity: '',
    petExperience: '',
    petTypes: []
  };

  /** Places offered by the dropdown; matches the 1–10 server rule. */
  readonly quantities: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  readonly petTypeOptions = ['Dog', 'Cat', 'Other'];

  formHidden = false;
  submitting = false;
  success = false;
  successText = 'Thank you. Your place has been reserved and a confirmation email is on its way.';
  errorMessage = '';

  private eventId: string | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('id');

    if (!this.eventId) {
      this.state = 'error';
      this.summaryError = 'No service specified. Please go back and select a service.';
      this.formHidden = true;
      return;
    }

    this.load(this.eventId);
  }

  /** Toggles one pet type on/off in the checkbox group. */
  togglePetType(type: string): void {
    const index = this.form.petTypes.indexOf(type);
    if (index === -1) {
      this.form.petTypes = [...this.form.petTypes, type];
    } else {
      this.form.petTypes = this.form.petTypes.filter(item => item !== type);
    }
  }

  isPetTypeSelected(type: string): boolean {
    return this.form.petTypes.includes(type);
  }

  async submit(): Promise<void> {
    // Client-side validation: any failure is reported with an alert, as before.
    const errors = this.validate();
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    if (!this.eventId) return;

    this.submitting = true;

    try {
      const result = await this.api.createRegistration(this.eventId, {
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        quantity: Number(this.form.quantity),
        petExperience: this.form.petExperience || null,
        petTypes: this.form.petTypes
      });

      this.formHidden = true;
      this.success = true;
      this.successText =
        `Thanks ${result.name}. ${result.quantity} place${result.quantity > 1 ? 's have' : ' has'} been reserved. ` +
        'A confirmation email will be sent to ' + result.email + '.';
    } catch (error) {
      console.error('Registration failed:', error);
      let message = 'Registration failed. Please try again.';

      if (error instanceof ApiError) {
        if (error.status === 400) {
          message = error.message || 'Please check your information and try again.';
        } else if (error.status === 409) {
          message = 'This email is already registered for this service.';
        } else if (error.status === 404) {
          message = 'This service could not be found.';
        }
      }

      this.showError(message);
    } finally {
      this.submitting = false;
    }
  }

  private async load(id: string): Promise<void> {
    try {
      const event = await this.api.getEvent(id);
      this.event = event;
      this.state = 'ready';

      if (event.status === 'suspended') {
        this.showError('Registration is closed for this service.');
        this.formHidden = true;
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      this.state = 'error';
      this.summaryError = 'Failed to load the service. Please try again.';
      this.formHidden = true;
    }
  }

  /** Same rules and messages as the original validateForm() setup. */
  private validate(): string[] {
    const errors: string[] = [];
    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const phone = this.form.phone.trim();

    if (!name) errors.push('Please enter your full name');
    else if (name.length < 2) errors.push('Name must be at least 2 characters');
    else if (name.length > 100) errors.push('Name must be at most 100 characters');

    if (!email) errors.push('Please enter your email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address');

    if (!phone) errors.push('Please enter your phone number');
    else if (!/^[\d\s\-+()]{8,15}$/.test(phone)) errors.push('Please enter a valid phone number');

    if (!this.form.quantity) errors.push('Please select the number of places');
    else if (!(Number(this.form.quantity) >= 1 && Number(this.form.quantity) <= 10)) {
      errors.push('Places must be between 1 and 10');
    }

    return errors;
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorBox?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
}
