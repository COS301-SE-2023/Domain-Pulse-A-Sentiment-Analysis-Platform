import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { MainComponent } from './main/main.component';
import { AuthGuardService } from './auth.guard';
import { HelpPageComponent } from './help-page/help-page.component';
import { SurveyRedirectGuard } from './survey-redirect.guard';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'help', component: HelpPageComponent},
  { path: 'register', component: RegisterPageComponent },
  {
    path: 'ingest/post-review/:source_id/:source_name',
    component: RegisterPageComponent,
    canActivate: [SurveyRedirectGuard],
  },
  { path: '', component: MainComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: 'register' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
