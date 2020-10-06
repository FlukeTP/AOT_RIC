import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'modal-success',
  templateUrl: './modalSuccess.component.html',
  styleUrls: ['./modalSuccess.component.css']
})
export class ModalSuccessComponent implements OnInit {
  @ViewChild('modalsuccess') mymodal: ElementRef;
  public modalRef: BsModalRef;

  @Input() header: string = 'แจ้งเตือน !';
  @Input() body: string;

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: BsModalService) { }


  ngOnInit() {
    console.log("header : ", this.header);
  }

  openModal(text: string = 'ทำรายการเสร็จสิ้น') {
    this.body = text;
    this.modalRef = this.modalService.show(this.mymodal);
  }
  onClick(key) {
    this.modalRef.hide();
    switch (key) {
      case 'close':
        this.onClose.emit();
        break;
    }
  }
}
