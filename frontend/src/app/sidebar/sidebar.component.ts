import { Component, Input } from '@angular/core';
import { BackendService, Domain } from '../backend.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'dp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
  animations: [
    trigger('logoSwitch', [
      state(
        'small',
        style({
          width: '50px',
          height: '50px',
          backgroundColor: 'green',
        })
      ),
      state(
        'large',
        style({ width: '100px', height: '50px', backgroundColor: 'red' })
      ),
      transition('small <=> large', [animate('0.3s')]),
      // transition(':enter', [style({ transform: 'scale(0.5)' }), animate(100)]),
      // transition(':leave', [animate(100, style({ transform: 'scale(0.5)' }))]),
    ]),
  ],
})
export class SidebarComponent {
  logoState = 'small';
  @Input() set expanded(value: boolean) {
    setTimeout(() => {
      this.logoState = value ? 'large' : 'small';
    }, 1);
  }

  // change logoState based on expanded
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
  newDomainImageName = '';

  showAddDomainModal = false;

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

  addNewDomain(): void {
    console.log('addNewDomain');
    console.log(this.newDomainName, this.newDomainImageName);
    this.backendService.addNewDomain(
      this.newDomainName,
      this.newDomainImageName
    );
    this.toggleDomainModal();
  }

  selectDomain(domain: Domain) {
    this.backendService.selectDomain(domain);
  }
}
