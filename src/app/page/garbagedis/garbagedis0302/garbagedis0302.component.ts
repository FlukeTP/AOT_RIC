import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';
import { DateStringPipe } from 'src/app/common/pipes/date-string.pipe';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
declare var $: any;

const URL = {
  LIST: "garbagedis003/list-trash-size"
};

@Component({
  selector: 'app-garbagedis0302',
  templateUrl: './garbagedis0302.component.html',
  styleUrls: ['./garbagedis0302.component.css']
})
export class Garbagedis0302Component implements OnInit {
  dataTable: any;
  dataList: any;
  remarkStr: string;
  
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      this.dataList = res.data
      this.initDataTable(this.dataList);
      // console.log("this.dataList : ", this.dataList);
      this.commonService.unLoading();
    });
  }

  initDataTable = (data: any[]) => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      scrollY: false,
      scrollCollapse: false,
      columns: [
        {
          data: 'createdDate', 
          render(data) {
           return new DateStringPipe().transform(data);
          }, className: 'text-center'
        }, {
          data: 'trashSize', 
          render(data) {
           return data + ' กก.'
          }, className: 'text-center'
        }, {
          data: 'chargeRates', 
          render(data) {
            var chargeBath
            if(data == null){
              chargeBath = '-'
            }else{
              chargeBath = data + ' บาท'
            }
           return chargeBath 
          }, className: 'text-center'
        }, {
          data: 'updatedDate',
          render(data) {
            var updateDate
            if(data == null){
              updateDate = '-'
            }else{
              updateDate = new DateStringPipe().transform(data);
            }
           return updateDate
          }, className: 'text-center'
        }, {
          data: 'updatedBy',
          render(data) {
            var updateBy
            if(data == null){
              updateBy = '-'
            }else{
              updateBy = data;
            }
           return updateBy
          }, className: 'text-center'
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });
    // remark button
    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onClickRemark(data.remark);
    });
    // edit button
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      console.log(data); 
      this.onEdit(data.trashSizeId);
    });
    // history button
    this.dataTable.on('click', 'tbody tr button#history', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      // this.onOpenModalHistory(data.codeType);
    });
  }

  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }

  onEdit(id: any) {
    console.log("IDD : ",id);
    this.router.navigate(['/garbagedis/garbagedis0302detail'], {
      queryParams: {
        id: id
      }
    });
  }

}
