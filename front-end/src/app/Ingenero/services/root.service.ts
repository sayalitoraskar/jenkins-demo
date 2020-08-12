import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RootService {
  chartOpen = new EventEmitter();
  configurationData: { targetTags: any[], performanceTags: any[] }[] = [];
  constructor(private http: HttpClient) { }

  openChart(show) {
    this.chartOpen.emit({
      chartId: show.tag,
      allCharts: show.allTags,
      view: show.flag
    });
  }

  getDummyData(): Observable<any> {
    return this.http.get('assets/data/dummyChart.json');
  }

  getDiagramValues(): Observable<any> {
    return this.http.get('assets/data/diagramValues.json');
  }
  getFilterData(): Observable<any> {
    return this.http.get('assets/data/filterData.json');
  }
  setConfiguration(targetTags, performanceTags) {
    this.configurationData = [];
    this.configurationData.push({
      targetTags, performanceTags
    });
    localStorage.setItem('config', JSON.stringify(this.configurationData));
  }
}
