import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';

const URLS = {
  GET_ALL: 'pos003/get_all',
  SEND_TO_SAP: 'pos003/sendToSAP',
}
@Component({
  selector: 'app-pos003',
  templateUrl: './pos003.component.html',
  styleUrls: ['./pos003.component.css']
})
export class Pos003Component implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "หมวดข้อมูลยอดรายได้",
      link: "/pos",
    },
    {
      label: "ข้อมูลยอดรายได้ของผู้ประกอบการ",
      link: "#",
    }
  ];

  dataTable: any;
  dataList: any[] = [];

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  // =============== Action ======================
  changeStatus(value: string) {
    switch (value) {
      case 'UNSENT':
        return 'ยังไม่ส่ง';
      case 'SENT':
        return 'ส่งแล้ว';
      default:
        break;
    }
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    // console.log("this.commonService.configDataTable", this.commonService.configDataTable);
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'startSaleDate', className: 'text-center'
        }, {
          data: 'endSaleDate', className: 'text-center'
        }, {
          data: 'fileName', className: 'text-left',
          render(data, type, row, meta) {
            return data;
          }
        }, {
          data: 'includingVatSale', className: 'text-right'
        }, {
          data: 'excludingVatSale', className: 'text-right'
        }, {
          data: 'createdDate', className: 'text-center'
        }, {
          data: 'sentStatus', className: 'text-center',
          render: (data, type, row, meta) => {
            return this.changeStatus(data);
          }
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = '';
            if (row.sentStatus == 'SENT') {
              _btn = `<button class="btn btn-warning btn-sm edit" disabled type="button"><i class="fa fa-pencil"></i></button>`;
            } else {
              _btn = `<button class="btn btn-warning btn-sm edit" type="button"><i class="fa fa-pencil"></i></button>`;
            }
            return _btn;
          }
        }, {
          className: 'text-center',
          data: 'sapStatus',
          render(data, type, full, meta) {
            let status = '';
            if (data === 'pending') {
              status = '<span class="text-warning">รอการส่ง</span>';
            } else if (data === SAP_CONSTANT.STATUS.CONNECTION_FAIL.CONST ||
              data === SAP_CONSTANT.STATUS.FAIL.CONST) {
              status = `<span class="text-danger">เกิดข้อผิดพลาด</span>
                      <button type="button" class="btn btn-info btn-social-icon" id="sapErr">
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </button>`;
            } else if (data === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
              status = '<span class="text-success">ส่งสำเร็จ</span>';
            }
            return status;
          }
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-success btn-sm" type="button" id="sendToSAP"><i class="fa fa-share-square-o" aria-hidden="true"></i>ส่งข้อมูลเข้าระบบ SAP</button>`;
          }
        }
      ],
    });
  }
  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button.edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/pos/pos003detail'], {
        queryParams: {
          revCusId: data.revCusId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(data.sapErrorDesc);
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data.revCusId);
    });
  }
  // =================== call back-end ===================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URLS.GET_ALL, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  sendToSAP(id: any) {
    let data = {
      header: {
        revCusId: id
      }
    }
    this.commonService.loading();
    this.ajax.doPost(URLS.SEND_TO_SAP, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
          this.modalSuccess.openModal();
        } else {
          this.modalError.openModal(res.data.message);
        }
        this.getList();
        // console.log(this.formGroup.value);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

}
