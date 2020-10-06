import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'button-download',
  templateUrl: './button-download.component.html',
  styleUrls: ['./button-download.component.css']
})
export class ButtonDownloadComponent implements OnInit {
  @Input() wording: string = 'ดาวน์โหลดไฟล์';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
