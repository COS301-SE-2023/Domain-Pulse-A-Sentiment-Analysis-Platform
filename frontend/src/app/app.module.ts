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
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { MainComponent } from './main/main.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from './app.state';
import { AppApi } from './app.api';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { SourceSelectorComponent } from './source-selector/source-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ModalContainerComponent,
    StatisticSelectorComponent,
    GraphSelectorComponent,
    CommentsViewComponent,
    LoginPageComponent,
    RegisterPageComponent,
    MainComponent,
    SourceSelectorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxsModule.forRoot([AppState]),
    NgxsLoggerPluginModule.forRoot({
      collapsed: false,
      // disabled: ENVIRONMENT == 'production',
    }),
  ],
  providers: [AppApi, BackendService],
  bootstrap: [AppComponent],
})
export class AppModule {}
