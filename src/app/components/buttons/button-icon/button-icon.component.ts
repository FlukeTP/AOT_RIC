import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-icon',
  templateUrl: './button-icon.component.html',
  styleUrls: ['./button-icon.component.css']
})
export class ButtonIconComponent implements OnInit {

  @Input() color: string = 'info';
  @Input() btnType: string = "button";
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
