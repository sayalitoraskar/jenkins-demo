import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { IngeneroModule } from './Ingenero/ingenero.module';
import 'hammerjs';
import 'chartjs-plugin-zoom';
import { ChartsModule } from 'ng2-charts';
import { RootService } from './Ingenero/services/root.service';

@NgModule({
  declarations: [
	AppComponent
  ],
  imports: [
	BrowserModule,
	AppRoutingModule,
	HttpClientModule,
  IngeneroModule,
  ChartsModule,
	BrowserAnimationsModule
  ],
  providers: [RootService],
  bootstrap: [AppComponent]
})
export class AppModule { }
