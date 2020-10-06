import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-custom',
  templateUrl: './button-custom.component.html',
  styleUrls: ['./button-custom.component.css']
})
export class ButtonCustomComponent implements OnInit {

  @Input() color: string = 'info';
  @Input() btnType: string = "button";
  @Input() wording: string = "";
  @Input() icon: string = "";
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
