import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-close',
  templateUrl: './button-close.component.html',
  styleUrls: ['./button-close.component.css']
})
export class ButtonCloseComponent implements OnInit {
  @Input() wording: string = 'ปิด';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
