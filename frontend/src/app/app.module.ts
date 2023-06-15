import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ModalContainerComponent } from './modal-container/modal-container.component';
import { BackendService } from './backend.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StatisticSelectorComponent } from './statistic-selector/statistic-selector.component';
import { GraphSelectorComponent } from './graph-selector/graph-selector.component';
import { CommentsViewComponent } from './comments-view/comments-view.component';

@NgModule({
  declarations: [AppComponent, SidebarComponent, ModalContainerComponent, StatisticSelectorComponent, GraphSelectorComponent, CommentsViewComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [BackendService],
  bootstrap: [AppComponent],
})
export class AppModule {}
