import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'modal-custom',
  templateUrl: './modalCustom.component.html',
  styleUrls: ['./modalCustom.component.css']
})
export class ModalCustomComponent implements OnInit {
  public static MODAL_SIZE = {
    SMALL: 'modal-sm',
    LARGE: 'modal-lg',
    EXTRA_LARGE: 'modal-xl',
  }
  public static MODAL_ACTION = {
    CONFIRM: 'confirm',
    CLOSE: 'close',
  }

  @ViewChild('modalCustom') mymodal: ElementRef;
  public modalRef: BsModalRef;

  @Input() header: string = '';
  @Input() body: string = 'กรุณายืนยันการทำรายการ';
  @Input() footer: string = '';

  @Output() onConfirm: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: BsModalService) { }


  ngOnInit() {
    console.log("header : ", this.header);
  }

  openModal(className: string = ModalCustomComponent.MODAL_SIZE.SMALL) {
    this.modalRef = this.modalService.show(this.mymodal, { class: className });
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
