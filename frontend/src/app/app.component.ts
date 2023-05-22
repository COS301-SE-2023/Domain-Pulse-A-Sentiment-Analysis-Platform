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

  newSouceName = '';
  newSourcePlatform = '';

  constructor(private backendService: BackendService) {}

  addNewSource() {
    console.log('platform: ' + this.newSourcePlatform);
    this.backendService.addNewSource(this.newSouceName, this.newSourcePlatform);
    this.newSouceName = '';

    this.toggleAddSourcesModal();
  }

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
