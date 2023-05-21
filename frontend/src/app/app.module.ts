import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ModalContainerComponent } from './modal-container/modal-container.component';
import { BackendService } from './backend.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, SidebarComponent, ModalContainerComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [BackendService],
  bootstrap: [AppComponent],
})
export class AppModule {}
