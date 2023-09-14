import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import {AccordionModule} from "ngx-accordion";
@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.sass']
})
export class HelpPageComponent implements AfterViewInit {
  collapsing = true;
  searchTerm = "";
  accordionItems: NodeListOf<Element> | undefined;

  constructor(private route: ActivatedRoute) {}

  ngAfterViewInit() {
    this.accordionItems = document.querySelectorAll('accordion');

    this.route.queryParams
      .subscribe(params => {
        console.log(params); 
        this.searchTerm = params['q'];
        this.filterAccordionByText(this.searchTerm);
      }
    );
  }

  filterAccordionByText(textToFilter: string) {
    if (!this.accordionItems) {
      return;
    }
  }
}
