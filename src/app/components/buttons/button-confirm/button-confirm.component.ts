import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-confirm',
  templateUrl: './button-confirm.component.html',
  styleUrls: ['./button-confirm.component.css']
})
export class ButtonConfirmComponent implements OnInit {
  @Input() wording: string = 'ยืนยัน';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
