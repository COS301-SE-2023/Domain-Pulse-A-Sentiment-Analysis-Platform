import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
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
        this.filterAccordionByText();
      }
    );
  }

  filterAccordionByText() {
    const textToFilter = this.searchTerm;
    if (!this.accordionItems) {
      return;
    }
    if (this.searchTerm === "") {
      this.accordionItems.forEach((item: any) => item.style.display = 'block');
      return;
    }
    this.accordionItems.forEach((item: any) => {
      const headerTextT = item;
      if (!headerTextT)
        return;
      const text = headerTextT.innerText;
      console.log(headerTextT, text);

      if (text.toLowerCase().includes(textToFilter.toLowerCase())) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

  }
}
