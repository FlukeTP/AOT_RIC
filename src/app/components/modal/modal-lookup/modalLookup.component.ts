import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'modal-lookup',
  templateUrl: './modalLookup.component.html',
  styleUrls: ['./modalLookup.component.css']
})
export class ModalLookupComponent implements OnInit , OnDestroy {
  @ViewChild('modalLookup') mymodal: ElementRef;
  public modalRef: BsModalRef;
  
  @Input() header: string = 'รายการ';

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onSelected: EventEmitter<any> = new EventEmitter();

  dtOptions: DataTables.Settings = {};
  constructor(private modalService: BsModalService) { 
    this.dtOptions = {
      pagingType: 'full_numbers',
      ordering: false,
      scrollX: true,
      lengthChange: false,
      info: false,
      pageLength: 10,
      columns: [{
        data: 'data1'
      }, {
        render: function (data, type, full, meta) {
          let btn = '';
          btn += `<button class="btn btn-success edit" (click)="onSelect(data)" type="button">เลือก</button>`;
          return btn;
        }, className: "text-center"
      }]
    };
  }


  ngOnInit() {
    console.log("header : ", this.header);
    // this.table.on("click", "td > button.edit", (event) => {
    //   var data = this.table.row($(event.currentTarget).closest("tr")).data();
    //   this.editData(data);
    //   this.tabSlite(3);
    //   console.log("test : ", data);
    // });
  }

  ngOnDestroy(): void {

  }

  listData(dataList = null){
    this.dtOptions
    dataList = [
      {
        data1: "กรมส่งเสริมคุณภาพสิ่งแวดล้อม",
        value: "1",
      },
      {
        data1: "กรมส่งเสริมคุณภาพสิ่งแวดล้อม",
        value: "2",
      },
      {
        data1: "กรมส่งเสริมคุณภาพสิ่งแวดล้อม",
        value: "3",
      }];
      this.dtOptions.data = dataList;
  }
  openModal(){
    this.modalRef = this.modalService.show(this.mymodal , {class: 'modal-lg'});
  }
  onClick(key){
    this.modalRef.hide();
    switch (key) {
      case 'close':
        this.onClose.emit();
        break;
    }    
  }
  onSelect(data){
    // console.log('Button in the row clicked.');
    // console.log({data: data, value: value});
    console.log(" onSelect " , data);
    this.onSelected.emit({...data});
    this.modalRef.hide();
  }
}
