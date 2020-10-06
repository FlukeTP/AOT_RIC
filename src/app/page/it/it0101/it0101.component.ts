import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { CheckNumber, Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';

const URL = {
  EXPORT: "download-template-info",
  GET_ALL: "it0101/get_all",
}
@Component({
  selector: 'app-it0101',
  templateUrl: './it0101.component.html',
  styleUrls: ['./it0101.component.css']
})
export class It0101Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการ IT",
      link: "#",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการเครือข่าย",
      link: "#",
    }

  ];

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
  async ngAfterViewInit() {
    await this.getList();
    // this.initDataTable();
    // call Function event Click button in dataTable
    // this.clickBtn();
  }
  // =============== Action ======================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }
  // =============== back-end =======================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, {}).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        await this.initDataTable();
        this.clickBtn();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/IT0101/${arrOfId.join(",")}`);
    this.commonService.unLoading();
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
          data: 'effectiveDate', className: 'text-center'
        }, {
          data: 'serviceType', className: 'text-left'
        }, {
          data: 'chargeRate', className: 'text-right',
          render(data, type, row, meta) {
            let total = Utils.isNotNull(data) ? data.toFixed(2) : 0.00;
            return `${CheckNumber(total)}`;
          }
        }, {
          data: 'updatedDate', className: 'text-center'
        }, {
          data: 'updatedBy', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = '<button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>';
            _btn += '<button class="btn btn-warning btn-sm" id="edit" type="button"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>';
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
      this.router.navigate(['/it/it0101detail'], {
        queryParams: {
          itNetworkConfigId: data.itNetworkConfigId
        }
      })
    });
  }
}
