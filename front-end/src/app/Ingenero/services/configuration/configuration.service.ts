import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MasterTags, Tag } from '../../models';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ConfigurationService {
	BACKEND_API = environment.prodUrl;
	snackBarConfig: MatSnackBarConfig = {
		duration: 2000,
		horizontalPosition: 'end',
		verticalPosition: 'top',
	};

	constructor(private http: HttpClient, private snackbar: MatSnackBar) {}

	showSuccessNotification(message: string, action: string = ''): void {
		this.snackbar.open(message, action, {
			...this.snackBarConfig,
			panelClass: 'snack-bar-success',
		});
	}

	showErrorNotification(message: string, action: string = ''): void {
		this.snackbar.open(message, action, {
			...this.snackBarConfig,
			panelClass: 'snack-bar-error',
		});
	}

	arrangeItems(data: MasterTags) {
		const sortedTags = {};
		for (const key in Tag) {
			if (Tag.hasOwnProperty(key)) {
				sortedTags[Tag[key]] = data[Tag[key]];
			}
		}
		return sortedTags;
	}
	getConfigurationForAllTags(): any {
		return this.http.get(`${this.BACKEND_API}configuration`).pipe(
			map((tags: MasterTags) => this.arrangeItems(tags)),
			catchError((e) =>
				this.handleError(e, 'Configuration Data Not Available !!')
			)
		);
	}

	handleError(error, message) {
		this.showErrorNotification(message);
		return throwError(message);
	}

	getMappingForAllTags(): Observable<any> {
		return this.http
			.get(`${this.BACKEND_API}tags/mapping`)
			.pipe(
				catchError((e) =>
					this.handleError(e, 'Mapping Data Not Available !!')
				)
			);
	}

	getPerformanceData(): Observable<any> {
		return this.http
			.get(`${this.BACKEND_API}tags/type/Performance`)
			.pipe(
				catchError((e) =>
					this.handleError(e, 'Performance Data Not Available !!')
				)
			);
	}
	saveData(data): Observable<any> {
		return this.http
			.post(`${this.BACKEND_API}configuration`, data)
			.pipe(
				catchError((e) => this.handleError(e, 'Failed to save Data !!'))
			);
	}

	updateMapping(data): Observable<any> {
		return this.http
			.patch(`${this.BACKEND_API}tags/mapping`, data)
			.pipe(
				catchError((e) =>
					this.handleError(e, 'Failed to save Mapping !!')
				)
			);
	}

	resetToDefault(): Observable<any> {
		return this.http
			.get(`${this.BACKEND_API}tags/default-values`)
			.pipe(
				catchError((e) =>
					this.handleError(e, 'Failed to reset Data !!')
				)
			);
	}
}
