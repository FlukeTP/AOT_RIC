import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-sap',
  templateUrl: './button-sap.component.html',
  styleUrls: ['./button-sap.component.css']
})
export class ButtonSapComponent implements OnInit {
  @Input() wording: string = 'ส่งข้อมูลเข้าระบบ SAP';
  @Input() btnType: string = "button";
  @Input() disabled: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
