import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[commentsAccordionTitle]"
})
export class CommentsAccordionTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}
