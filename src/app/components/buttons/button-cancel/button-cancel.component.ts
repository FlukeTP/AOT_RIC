import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-cancel',
  templateUrl: './button-cancel.component.html',
  styleUrls: ['./button-cancel.component.css']
})
export class ButtonCancelComponent implements OnInit {
  @Input() wording: string = 'ยกเลิก';
  @Input() btnType: string = "button";
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
