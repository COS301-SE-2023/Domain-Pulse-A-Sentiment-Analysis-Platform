import { ContentChild, Directive, Input } from "@angular/core";
import { CommentsAccordionContent } from "./comments-accordion-content.directive";
import { CommentsAccordionHeader } from "./comments-accordion-header.directive";
import { CommentsAccordionTitle } from "./comments-accordion-title.directive";

@Directive({
  selector: "commentsAccordion-item"
})
export class CommentsAccordionItem {
  @Input() title = "";
  @Input() disabled = false;
  @Input() expanded = false;
  @ContentChild(CommentsAccordionContent) content!: CommentsAccordionContent;
  @ContentChild(CommentsAccordionTitle) customTitle!: CommentsAccordionTitle;
  @ContentChild(CommentsAccordionHeader) customHeader!: CommentsAccordionHeader;
}
