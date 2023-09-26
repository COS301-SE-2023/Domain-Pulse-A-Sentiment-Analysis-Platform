import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[commentsAccordionContent]"
})
export class CommentsAccordionContent {
  constructor(public templateRef: TemplateRef<any>) {}
}
