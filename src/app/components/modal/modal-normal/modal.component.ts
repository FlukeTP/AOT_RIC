import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {


  @Input() modalId: string = 'modalId';
  @Input() header: string = 'แจ้งเตือน';
  @Input() body: string = 'ยืนยันทำรายการ';
  
  constructor() { }


  ngOnInit() {
    console.log("header : ", this.header);
  }
}
