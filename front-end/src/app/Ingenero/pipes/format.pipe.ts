import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'format',
})
export class FormatPipe implements PipeTransform {
	transform(value: object | string, arg: unknown): string[] | string {
		if (!value) {
			return [];
		}
		if (value) {
			if (arg == 'keys') {
				return Object.keys(value);
			}
			if (arg == 'title') {
				return (value as string)
					.replace(/([A-Z])/g, ' $1')
					.replace(/^./, (str) => str.toUpperCase());
			}
			if (arg == 'checkType') {
				return typeof value;
			}
		}
	}
}
