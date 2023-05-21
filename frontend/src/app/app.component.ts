import { Component } from '@angular/core';
import { BackendService } from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'Domain Pulse';

  showAddSourcesModal = false;
  selectedDomain$ = this.backendService.selectedDomain$;
  constructor(private backendService: BackendService) {}

  toggleAddSourcesModal() {
    if (!this.showAddSourcesModal) {
      // this.windows[0].scrolling = false;
      this.showAddSourcesModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showAddSourcesModal = false;
    }
  }
}
