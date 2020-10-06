import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-add',
  templateUrl: './button-add.component.html',
  styleUrls: ['./button-add.component.css']
})
export class ButtonAddComponent implements OnInit {
  @Input() wording: string = 'เพิ่มข้อมูล';

  @Input() disabled: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

}
