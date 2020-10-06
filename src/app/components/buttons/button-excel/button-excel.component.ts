import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-excel',
  templateUrl: './button-excel.component.html',
  styleUrls: ['./button-excel.component.css']
})
export class ButtonExcelComponent implements OnInit {
  @Input() wording: string = 'อัพโหลด Excel';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
