

import { Injectable } from '@angular/core';

declare var $: any;
declare var contextPath: string;

@Injectable({
	providedIn: 'root',
})
export class CommonService {
	public localPath = location.origin + location.pathname;
	private gif = this.localPath + '/assets/img/loading.svg';

	constructor() { }
	public loading() {
		$.blockUI({
			message: '<div class="container h-100 d-flex justify-content-center"><img src="' + this.gif + '" height="150px"/></div>',
			overlayCSS: {
				background: 'rgba(0, 0, 0)',
				opacity: 0.9,
				cursor: 'wait'

			},
			css: {
				background: 'none',
				border: 'none',
			}
		});
	}
	public unLoading() {
		$.unblockUI();
	}

	public configDataTable() {
		return {
			pagingType: 'full_numbers',
			ordering: false,
			scrollX: false,
			lengthChange: false,
			info: false,
			pageLength: 20,
			searching: false,
			processing: true,
			serverSide: false
		};
	}
}
