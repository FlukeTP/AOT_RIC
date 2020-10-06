import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'button-downloadex',
  templateUrl: './button-downloadex.component.html',
  styleUrls: ['./button-downloadex.component.css']
})
export class ButtonDownloadExComponent implements OnInit {
  @Input() wording: string = 'ดาวน์โหลด Excel';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
