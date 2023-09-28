import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[accordionContent]"
})
export class AccordionContent {
  constructor(public templateRef: TemplateRef<any>) {}
}
