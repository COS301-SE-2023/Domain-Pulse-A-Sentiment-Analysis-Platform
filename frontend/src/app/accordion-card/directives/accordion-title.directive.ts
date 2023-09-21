import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[accordionTitle]"
})
export class AccordionTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}
