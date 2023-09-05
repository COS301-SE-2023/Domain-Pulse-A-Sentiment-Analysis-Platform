import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[accordionHeader]"
})
export class AccordionHeader {
  constructor(public templateRef: TemplateRef<any>) {}
}
