import { ContentChild, Directive, Input } from "@angular/core";
import { AccordionContent } from "./accordion-content.directive";
import { AccordionHeader } from "./accordion-header.directive";
import { AccordionTitle } from "./accordion-title.directive";

@Directive({
  selector: "accordion-item"
})
export class AccordionItem {
  @Input() title = "";
  @Input() disabled = false;
  @Input() expanded = false;
  @ContentChild(AccordionContent) content!: AccordionContent;
  @ContentChild(AccordionTitle) customTitle!: AccordionTitle;
  @ContentChild(AccordionHeader) customHeader!: AccordionHeader;
}
