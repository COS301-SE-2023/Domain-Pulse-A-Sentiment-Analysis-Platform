import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[commentsAccordionHeader]"
})
export class CommentsAccordionHeader {
  constructor(public templateRef: TemplateRef<any>) {}
}
