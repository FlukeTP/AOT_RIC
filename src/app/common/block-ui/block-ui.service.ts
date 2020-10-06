import { Injectable } from '@angular/core';

declare var $: any;
@Injectable()
export class BlockUiService {

  constructor() { }

  public blockUi() {
    $.blockUI(
      {
        message: '<img src="assets/blockUi/loading.gif" style="width:74px; padding-bottom: 5px;"/><br>กำลังโหลด...',

        css: {
          'z-index': '1011',
          position: 'fixed',
          padding: '0px',
          margin: '0px',
          width: '30%',
          top: '40%',
          left: '35%',
          'text-align': 'center',
          color: 'rgb(251, 251, 251)',
          border: 'none',
          'background-color': 'transparent'
        }
      });
  }

  public unBlockUi() {
    $.unblockUI()
  }
}
