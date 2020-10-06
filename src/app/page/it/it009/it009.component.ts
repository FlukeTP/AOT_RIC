import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils, CheckNumber } from 'src/app/common/helper';

const URL = {
  GET_ALL: "it009/get_all",
  SEND_TO_SAP: 'it009/sendToSAP'
}
@Component({
  selector: 'app-it009',
  templateUrl: './it009.component.html',
  styleUrls: ['./it009.component.css']
})
export class It009Component implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการ Staff page และ Public page",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  dataTable: any;
  dataList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      customerName: [""],
      contractNo: [""],
      status: [""],
    })
  }
  // ===================== initial setting =============================
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.formGroup.get('startDate').patchValue('');
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // ==================== Ation =====================

  // =================== call back-end =========================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  sendToSAP(data: any) {
    this.commonService.loading();
    this.ajax.doPost(URL.SEND_TO_SAP, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
          this.modalSuccess.openModal();
        } else {
          this.modalError.openModal(res.data.message);
        }
        this.getList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
  // ========================= data table ===================
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
          data: 'customerName', className: 'text-left'
        }, {
          data: 'contractNo', className: 'text-left'
        }, {
          data: 'courseName', className: 'text-left'
        }, {
          data: 'chargeRates', className: 'text-right',
          render(data, type, row, meta) {
            let total = Utils.isNotNull(data) ? data.toFixed(2) : 0.00;
            return `${CheckNumber(total)} บาท/คน`;
          }
        }, {
          data: 'startDate', className: 'text-left'
        }, {
          data: 'personAmount', className: 'text-right',
          render(data, type, row, meta) {
            return `${CheckNumber(data)} คน`;
          }
        }, {
          data: 'totalAmount', className: 'text-right',
          render(data, type, row, meta) {
            let total = Utils.isNotNull(data) ? data.toFixed(2) : 0.00;
            return `${CheckNumber(total)} บาท`;
          }
        }, {
          data: 'invoiceNo', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          data: 'receiptNo', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          data: 'sapStatus',
          className: 'text-center',
          render(data, type, row, meta) {
            let status = '';
            if (data === 'pending') {
              status = `<span class="text-warning">${SAP_CONSTANT.STATUS.PENDING.DESC}</span>`;
            } else if (data === SAP_CONSTANT.STATUS.CONNECTION_FAIL.CONST ||
              data === SAP_CONSTANT.STATUS.FAIL.CONST) {
              status = `<span class="text-danger">${SAP_CONSTANT.STATUS.FAIL.DESC}</span>
                    <button type="button" class="btn btn-info btn-social-icon" id="sapErr">
                      <i class="fa fa-search" aria-hidden="true"></i>
                    </button>`;
            } else if (data === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
              status = `<span class="text-success">${SAP_CONSTANT.STATUS.SUCCESS.DESC}</span>`;
            }
            return status;
          }
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = '<button class="btn btn-warning btn-sm" id="edit" type="button">แก้ไข</button>'
              + '<button class="btn btn-success btn-sm" id="sendToSAP" type="button" ><i class="fa fa-share-square-o" aria-hidden="true"></i>ส่งข้อมูลเข้าระบบ SAP</button>';
            return _btn;
          }
        }
      ]
    });
  }
  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/firebrigade/firebrigade001detail'], {
        queryParams: {
          fireManageId: data.fireManageId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(data.sapErrorDesc);
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data);
    });
  }

}
