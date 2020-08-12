import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { MaterialModule } from '../material.module';
import { ChartComponent } from './chart/chart.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { BenchmarkingComponent } from './home/benchmarking/benchmarking.component';
import { TagsComponent } from './home/benchmarking/tags/tags.component';
import { HeaderComponent } from './home/header/header.component';
import { HomeComponent } from './home/home.component';
import { IngeneroComponent } from './ingenero.component';
import { FormatPipe } from './pipes/format.pipe';
import { DiagramValuesService } from './services/diagram-values.service';
import { ProfileComponent } from './side-panel/profile/profile.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { TagMappingComponent } from './tag-mapping/tag-mapping.component';
import { RootService } from './services/root.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { ExportCsvService } from './services/export-csv.service';
import { TagReadOnlyService } from './services/tag-read-only.service';
import { ChartService } from './services/chart.service';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
	},
	{
		path: 'config',
		component: ConfigurationComponent,
	},
];

@NgModule({
	declarations: [
		IngeneroComponent,
		HomeComponent,
		SidePanelComponent,
		HeaderComponent,
		BenchmarkingComponent,
		TagsComponent,
		ProfileComponent,
		ChartComponent,
		ConfigurationComponent,
		FormatPipe,
		TagMappingComponent,
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		ChartsModule,
		FormsModule,
		HighchartsChartModule,
		FlexLayoutModule,
		HttpClientModule,
		MaterialModule,
		ReactiveFormsModule,
	],
	exports: [IngeneroComponent],
	providers: [DiagramValuesService,ExportCsvService,TagReadOnlyService,ChartService],
})
export class IngeneroModule {}
