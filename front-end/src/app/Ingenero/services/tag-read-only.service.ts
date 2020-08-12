import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TagReadOnlyService {
  private url = environment.prodUrl;
  snackBarConfig: MatSnackBarConfig = {
		duration: 2000,
		horizontalPosition: 'end',
		verticalPosition: 'top',
	};
  constructor(private http: HttpClient, private snackbar: MatSnackBar) { }

  handleError(error, message) {
		this.showErrorNotification(message);
		return throwError(message);
  }
  
  getAllTagHistoryValues() :Observable<any>{
    return this.http.get(`${this.url}benchmark`).pipe(
      catchError((e) =>
        this.handleError(e, 'Failed to fetch history data')
      )
    );
  }
  getAllTagCurrentValues() :Observable<any>{
    return this.http.get(`${this.url}time-series-aggregated/current-values`).pipe(
      catchError((e) =>
        this.handleError(e, 'Failed to fetch current data')
      )
    );
  }

  showErrorNotification(message: string, action: string = ''): void {
		this.snackbar.open(message, action, {
			...this.snackBarConfig,
			panelClass: 'snack-bar-error',
		});
	}
}
