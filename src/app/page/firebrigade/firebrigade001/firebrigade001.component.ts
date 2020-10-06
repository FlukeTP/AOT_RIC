import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils, CheckNumber } from 'src/app/common/helper';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { DecimalFormatPipe } from 'src/app/common/pipes';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { NumberUtils } from 'src/app/common/helper/number';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT, CASH } from 'src/app/common/constant/CnDn.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';

const URL = {
  EXPORT: "download-template-info",
  GET_ALL: "firebrigade001/get_all",
  SEND_TO_SAP: 'firebrigade001/sendToSAP'
}
@Component({
  selector: 'app-firebrigade001',
  templateUrl: './firebrigade001.component.html',
  styleUrls: ['./firebrigade001.component.css']
})
export class Firebrigade001Component implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดดับเพลิง",
      link: "/home/firebrigade",
    },
    {
      label: "บริหารจัดการรายได้ค่าจัดฝึกอบรมการดับเพลิงและกู้ภัย",
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
    private modalService: BsModalService,
    private router: Router,
    private cndn: CnDnService
  ) {
    this.formGroup = this.fb.group({
      customerName: [""],
      contractNo: [""],
      courseName: [""],
      startDate: [""],
      endDate: [""],
    })
  }
  // ====================== initial setting ==============
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // ================== Action =================
  dateChange(event, formControlName: string) {
    this.formGroup.get(formControlName).patchValue(event);
  }
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

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formGroup.value).forEach(key => {
      if (this.formGroup.get(key).value !== "") {
        arrOfId.push(this.formGroup.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/FIREBRIGADE001/${arrOfId.join(",")}`);
    this.commonService.unLoading();
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
            let total = Utils.isNotNull(data) ? data : 0;
            return `${new DecimalFormatPipe().transform(total)} บาท/${row.unit}`;
          }
        }, {
          data: 'startDate', className: 'text-left'
        }, {
          data: 'personAmount', className: 'text-right',
          render(data, type, row, meta) {
            return NumberUtils.numberToDecimalFormat(data, '###,###');
          }
        }, {
          data: 'totalAmount', className: 'text-right',
          render(data, type, row, meta) {
            let total = Utils.isNotNull(data) ? data : 0;
            return new DecimalFormatPipe().transform(total);
          }
        }, {
          data: 'paymentType', className: 'text-center'
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
            let res = MessageService.SAP.getStatus(data, "sapErr")
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        }, {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn;
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข', true)} ${ButtonDatatable.sap('sendToSAP', true)}`
            } else {
              _btn = `${ButtonDatatable.edit('edit')} ${ButtonDatatable.sap('sendToSAP')}`;
            }
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
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDesc));
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let glAccount = "4105090001";
      if (CASH.CASH_TH === data.paymentType) {
        glAccount = sapJsonReq.header[0].item[0].account
      }
      let cndnData: CnDnRequest = {
        id: data.fireManageId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.FIREBRIGADE.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: data.totalAmount,
        glAccount: glAccount,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/firebrigade/firebrigade001"
        }
      });
    });
  }
}
