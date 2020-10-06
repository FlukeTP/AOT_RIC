import { Component, OnInit } from '@angular/core';
import { BlockUiService } from 'src/app/common/block-ui/block-ui.service';
declare var $: any;
@Component({
  selector: 'app-blockui',
  templateUrl: './blockui.component.html',
  styleUrls: ['./blockui.component.css']
})
export class BlockuiComponent implements OnInit {

  constructor(
    private blockui: BlockUiService
  ) { }

  blockuitxt: string = `constructor(
    private blockui: BlockUiService
  ) { }

  this.blockui.blockUi();

  this.blockui.unBlockUi();
  `
  ngOnInit() {
    $('#element').toast('show')
  }

  blockUi() {
    this.blockui.blockUi();
    setTimeout(() => {
      this.blockui.unBlockUi();
    }, 1500);
  }
}
