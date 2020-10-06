import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-back',
  templateUrl: './button-back.component.html',
  styleUrls: ['./button-back.component.css']
})
export class ButtonBackComponent implements OnInit {
  @Input() wording: string = 'ย้อนกลับ';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
