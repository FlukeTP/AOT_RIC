import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'button-upload',
  templateUrl: './button-upload.component.html',
  styleUrls: ['./button-upload.component.css']
})
export class ButtonUploadComponent implements OnInit {
  @Input() wording: string = 'อัพโหลดไฟล์';
  @Input() disabled: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
