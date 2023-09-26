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

  constructor(private route: ActivatedRoute) { }

  ngAfterViewInit() {
    this.accordionItems = document.querySelectorAll('accordion');

  }

  filterAccordionByText() {
    const textToFilter = this.searchTerm;
    const shownCategories = new Set();

    if (!this.accordionItems) {
      return;
    }
    if (this.searchTerm === "") {
      this.accordionItems.forEach((item: any) => item.style.display = 'block');
      document.querySelectorAll('.heading').forEach((item: any) => item.style.display = 'block');
      return;
    }

    let atleastOne = false;
    this.accordionItems.forEach((item: any) => {
      const headerTextT = item;
      if (!headerTextT)
        return;
      const text = headerTextT.innerText;
      console.log(headerTextT, text);

      if (text.toLowerCase().includes(textToFilter.toLowerCase())) {
        item.style.display = 'block';
        atleastOne = true;
        shownCategories.add(item.getAttribute('data-catID'));
      } else {
        item.style.display = 'none';
      }
    });

    const noResultsIMG = document.querySelector('#noResults');
    if (noResultsIMG) {
      (noResultsIMG as any).style.display = atleastOne ? 'none' : 'flex';
    }


    const allCategoryElements = document.querySelectorAll('.heading');

    console.log(shownCategories);

    allCategoryElements.forEach((categoryElement: any) => {
      const catID = categoryElement.getAttribute('data-catID');

      if (!shownCategories.has(catID)) {
        categoryElement.style.display = 'none';
      } else {
        categoryElement.style.display = 'block';
      }
    });
  }

}
