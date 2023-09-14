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

}
