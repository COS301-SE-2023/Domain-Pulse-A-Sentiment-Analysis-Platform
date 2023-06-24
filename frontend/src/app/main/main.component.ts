import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  animateChild,
  query,
} from '@angular/animations';
import { AppState, DisplayDomain } from '../app.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('collapsed', [
      state(
        'collapsed',
        style({
          width: '5%',
        })
      ),
      state(
        'notCollapsed',
        style({
          width: '20%',
        })
      ),
      transition(
        'collapsed <=> notCollapsed',
        group([
          query('@logoSwitch', [animateChild()]),
          animate('0.3s ease-in-out'),
        ])
      ),
    ]),
  ],
})
export class MainComponent {
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
      this.showAddSourcesModal = true;
    } else {
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
