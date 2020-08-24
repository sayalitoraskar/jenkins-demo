import { Component, OnInit } from '@angular/core';
import { RootService } from './services/root.service';

@Component({
  selector: 'ig-ingenero',
  templateUrl: './ingenero.component.html',
  styleUrls: ['./ingenero.component.scss']
})
export class IngeneroComponent implements OnInit {
  viewChart = false;
  tagId;
  allCharts = [];
  showFiller = true;
  chartClass = "chartExpandSection"
  constructor(private rootService: RootService) { }

  ngOnInit(): void {
    this.rootService.chartOpen.subscribe(data => {
      this.allCharts = data.allCharts;
      this.viewChart = data.view;
      this.tagId = data.chartId;
    })
  }
  collapseMenu() {
    this.showFiller = !this.showFiller;
    if (this.showFiller) {
      this.chartClass = "chartExpandSection";
    }
    else {
      this.chartClass = "chartCollapseSection";
    }

  }
}
