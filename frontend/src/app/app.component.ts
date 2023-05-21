import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'Domain Pulse';

  showAddSourcesModal = false;

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
