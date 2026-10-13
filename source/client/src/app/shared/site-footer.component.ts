import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Tender Paws{{ variant === 'admin' ? ' Admin' : '. Every paw deserves a home.' }}</p>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {
  @Input() variant: 'public' | 'admin' = 'public';
}
