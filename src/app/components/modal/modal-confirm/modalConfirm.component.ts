import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalReq, ModalConfirm } from 'src/app/_model/modal.model';
@Component({
  selector: 'modal-confirm',
  templateUrl: './modalConfirm.component.html',
  styleUrls: ['./modalConfirm.component.css']
})
export class ModalConfirmComponent implements OnInit {
  @ViewChild('modalConfirm') mymodal: ElementRef;
  public modalRef: BsModalRef;

  @Input() header: string = 'ยืนยัน';
  @Input() body: string = 'ยืนยันการทำรายการ';

  @Output() onConfirm: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: BsModalService) { }


  ngOnInit() {
    console.log("header : ", this.header);
  }

  openModal(modal: ModalConfirm = new ModalConfirm()) {
    this.header = modal.header;
    this.body = modal.body;
    this.modalRef = this.modalService.show(this.mymodal);
  }
  onClick(key) {
    this.modalRef.hide();
    switch (key) {
      case 'confirm':
        this.onConfirm.emit();
        break;
      case 'close':
        this.onClose.emit();
        break;
      default:
        break;
    }
  }
}
