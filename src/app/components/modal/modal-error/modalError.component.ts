import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'modal-error',
  templateUrl: './modalError.component.html',
  styleUrls: ['./modalError.component.css']
})
export class ModalErrorComponent implements OnInit {
  @ViewChild('modalerror') mymodal: ElementRef;
  public modalRef: BsModalRef;
  
  @Input() header: string = 'เกิดข้อผิดพลาด !';
  @Input() body: string = 'ทำรายการเสร็จสิ้น';

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: BsModalService) { }


  ngOnInit() {
    console.log("header : ", this.header);
  }

  openModal(text){
    this.body = text;
    this.modalRef = this.modalService.show(this.mymodal);
  }
  onClick(key){
    this.modalRef.hide();
    switch (key) {
      case 'close':
        this.onClose.emit();
        break;
    }    
  }
}
