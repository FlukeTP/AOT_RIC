import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Utils, CheckNumber } from 'src/app/common/helper';

const URL = {
  GET_ALL: "it0105/get_all",
}
@Component({
  selector: 'app-it0105',
  templateUrl: './it0105.component.html',
  styleUrls: ['./it0105.component.css']
})
export class It0105Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  remarkStr: string = '';
  dataTable: any;
  dataList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }
  // ===================== Initial setting ============
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // =============== Action ======================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }
  // =============== back-end =======================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
  // ================= data table ====================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'effectiveDate', className: 'text-left'
        }, {
          data: 'serviceType', className: 'text-left'
        }, {
          data: 'chargeRate', className: 'text-right',
          render(data, type, row, meta) {
            let total = Utils.isNotNull(data) ? data.toFixed(2) : 0.00;
            return `${CheckNumber(total)}`;
          }
        }, {
          data: 'updatedDate', className: 'text-left'
        }, {
          data: 'updatedBy', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = '<button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>';
            return _btn;
          }
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = '<button class="btn btn-warning btn-sm" id="edit" type="button"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>';
            return _btn;
          }
        }, {
          className: "text-center",
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>`;
            return _btn;
          }
        }
      ]
    });
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'button#remark', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.onClickRemark(data.remark);
    });

    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/it/it0105detail'], {
        queryParams: {
          itPageConfigId: data.itPageConfigId
        }
      })
    });
  }
}
