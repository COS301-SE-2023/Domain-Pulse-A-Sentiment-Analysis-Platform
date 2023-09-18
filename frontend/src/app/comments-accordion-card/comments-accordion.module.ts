import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { CommentsAccordionComponent } from "./comments-accordion.component";
import { CommentsAccordionItem } from "./directives/comments-accordion-item.directive";
import { CommentsAccordionContent } from "./directives/comments-accordion-content.directive";
import { CommentsAccordionTitle } from "./directives/comments-accordion-title.directive";
import { CommentsAccordionHeader } from "./directives/comments-accordion-header.directive";

@NgModule({
  declarations: [
    CommentsAccordionComponent,
    CommentsAccordionItem,
    CommentsAccordionContent,
    CommentsAccordionTitle,
    CommentsAccordionHeader
  ],
  imports: [CommonModule],
  exports: [
    CommentsAccordionComponent,
    CommentsAccordionItem,
    CommentsAccordionContent,
    CommentsAccordionTitle,
    CommentsAccordionHeader
  ]
})
export class CommentsAccordionModule {}
