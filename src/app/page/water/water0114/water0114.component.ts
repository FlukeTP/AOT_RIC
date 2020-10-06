import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { DecimalFormatPipe } from 'src/app/common/pipes/decimal-format.pipe';
import { IsEmptyPipe } from 'src/app/common/pipes/empty.pipe';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Router } from '@angular/router';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { MessageService } from 'src/app/_service/message.service';
declare var $: any;
const URL = {
  EXPORT: "download-template-info",
  GET: "water0114/get"
}
@Component({
  selector: 'app-water0114',
  templateUrl: './water0114.component.html',
  styleUrls: ['./water0114.component.css']
})
export class Water0114Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  dataList: any[] = [];
  dataTable: any;

  remarkStr: string = '';

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getList();
  }

  //=============== action ===============================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }

  onEdit(id: any) {
    this.router.navigate(["/water/water0114detail"], {
      queryParams: {
        id: id
      }
    });
  }
  //================ call back-end ========================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET, {}).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.length > 0) {
          this.dataList = res.data;
        } else {
          this.dataList = [];
        }
      } else {
        this.dataList = [];
        this.modalError.openModal(res.message);
      }
      this.initDataTable();
      this.commonService.unLoading();
    });

  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    this.ajax.download(`${URL.EXPORT}/WATER0114/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }
  //=============== table =======================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [
        {
          data: 'airport', className: 'text-left'
        }, {
          data: 'modifiedDate', className: 'text-center'
        }, {
          data: 'serviceType', className: 'text-left'
        }, {
          data: 'chargeRates',
          render(data) {
            return new DecimalFormatPipe().transform(data);
          }, className: 'text-right'
        }, {
          data: 'updatedDate',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        }, {
          data: 'updatedBy',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `
            <button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });
    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onClickRemark(data.remark);
    });
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onEdit(data.wasteConfigId);
    });
  }
}
