import { Component } from '@angular/core';
import { BackendService } from './backend.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  animations: [
    trigger('collapsed', [
      state(
        'collapsed',
        style({
          maxWidth: '5%',
        })
      ),
      state(
        'notCollapsed',
        style({
          maxWidth: '20%',
        })
      ),
      transition('collapsed <=> notCollapsed', [animate('0.3s ease-in-out')]),
    ]),
  ],
})
export class AppComponent {
  sidebarCollapsed = true;
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

  openSidebar() {
    this.sidebarCollapsed = false;
  }

  colapseSidebar() {
    setTimeout(() => {
      this.sidebarCollapsed = true;
    }, 300);
  }
}
