import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private url = environment.prodUrl;
  constructor(private http: HttpClient) { }

  getChartData(id):Observable<any>{
    return this.http.get(`${this.url}time-series-aggregated/one-year/tag/${id}`);
  }
  updateAxis(tag):Observable<any> {
    return this.http.patch(`${this.url}tags/y-axis`,tag);
  }
}
