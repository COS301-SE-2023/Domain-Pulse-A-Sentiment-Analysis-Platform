import { Component ,Input } from '@angular/core';
import {trigger,style,state,transition,animate} from '@angular/animations';

@Component({
  selector: 'accordion-card',
  templateUrl: './accordion-card.component.html',
  styleUrls: ['./accordion-card.component.sass'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({height: '0px', opacity: 0})),
      state('expanded', style({height: 'auto', opacity: 1})),
      transition('collapsed => expanded', animate('300ms ease-in')),
      transition('expanded => collapsed', animate('300ms ease-out'))
    ])
  ]
})
export class AccordionCardComponent {
  @Input() isExpanded: boolean = true;
  @Input() title: string = '';

  constructor() { }

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
  }

  getCardState() {
    return this.isExpanded ? 'expanded' : 'collapsed';
  }

  getCardClasses(){
    return {
      'custom-class': true,
    };
  }
}
