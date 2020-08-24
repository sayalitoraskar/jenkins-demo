import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DiagramValuesService } from '../../services/diagram-values.service';
import { RootService } from '../../services/root.service';
import { Observable } from 'rxjs';
@Component({
	selector: 'ig-benchmarking',
	templateUrl: './benchmarking.component.svg',
	styleUrls: ['./benchmarking.component.scss'],
})
export class BenchmarkingComponent implements OnInit {
	values;
	viewAll = false;
	@Input() allData;
	@Input() event: Observable<void>;
	@Input() diagramTags;
	chartAllTags=[];
	constructor(
		private router: Router,
		private rootService: RootService,
		private dialog: MatDialog,
		private valueService: DiagramValuesService
	) { }

	ngOnInit(): void {
		this.event.subscribe(data => {
			setTimeout(() => {
				if (this.diagramTags.viewValues.length > 0) {
          console.log("BenchmarkingComponent -> ngOnInit -> this.diagramTags", this.diagramTags)
					this.viewAll = true;
				}
			}, 500)
		})
	}

	openConfigurationComponent(): void {
		this.router.navigateByUrl('/config');
	}
	openChart(id) {
    this.chartAllTags=[];
    this.allData.forEach(key =>{
      this.chartAllTags.push({
				name:key.tag.name,
				desc:key.tag.desc,
        id:key.tag.id
      })
    })
    this.rootService.openChart({
      tag:id,
      allTags:this.chartAllTags,
      flag:true
    });
  }
}
