import { Component } from '@angular/core';
import { BackendService } from '../backend.service';

@Component({
  selector: 'dp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
})
export class SidebarComponent {
  domains$ = this.backendService.domains$;

  domains = [
    {
      name: 'apple',
      imageUrl: '../assets/apple-1-logo-png-transparent.png',
      selected: false,
    },
    {
      name: 'Starbucks',
      imageUrl: '../assets/starbucks-logo-69391AB0A9-seeklogo.com.png',
      selected: true,
    },
    {
      name: 'Mcdonalds',
      imageUrl: '../assets/donalds-logo.png',
      selected: false,
    },
    {
      name: 'Formula 1',
      imageUrl: '../assets/f1-logo.png',
      selected: false,
    },
  ];

  newDomainName = '';

  showAddDomainModal = false;

  addNewDomain(): void {
    this.backendService.addNewDomain();
    this.toggleDomainModal();
  }

  constructor(private backendService: BackendService) {}

  toggleDomainModal(): void {
    if (!this.showAddDomainModal) {
      // this.windows[0].scrolling = false;
      this.showAddDomainModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showAddDomainModal = false;
    }
  }
}
