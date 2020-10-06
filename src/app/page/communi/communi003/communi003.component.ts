import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils, CheckNumber } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

const URL = {
  GET_ALL: "communi003/get-all",
  SEND_TO_SAP: 'communi003/send-to-sap'
}
@Component({
  selector: 'app-communi003',
  templateUrl: './communi003.component.html',
  styleUrls: ['./communi003.component.css']
})
export class Communi003Component implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "ขอใช้บริการหมวดสื่อสารอื่น ๆ ",
      link: "#",
    },

  ];

  /* form */
  formSearch = new FormGroup({});

  dataTable: any;
  dataList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private cndn: CnDnService
  ) { }
  // ====================== initial setting ==============
  ngOnInit() {
    this.initialVariable();
    this.search();
  }
  ngAfterViewInit() {
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // =================== call back-end =========================
  search() {
    this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }

  sendToSAP(id: number) {
    this.ajax.doPost(URL.SEND_TO_SAP, id).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal(res.message);
        this.search();
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }
  // ========================= data table ===================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderNumber = function (number: number, length: number = 0) {
      return Utils.isNull(number) ? "-" : $.fn.dataTable.render.number(",", ".", length, "").display(number);
    };

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [{
        data: 'customerCode', className: 'text-center'
      },
      {
        data: 'customerName', className: 'text-left'
      },
      {
        data: 'contractNo', className: 'text-center'
      },
      // {
      //   data: 'customerBranch', className: 'text-left'
      // },
      // {
      //   data: 'rentalAreaName', className: 'text-center'
      // },
      {
        data: 'startDate', className: 'text-center'
      },
      {
        data: 'endDate', className: 'text-center'
      },
      {
        data: 'serviceType', className: 'text-left'
      },
      {
        data: 'chargeRates', className: 'text-right',
        render(data, type, row, meta) {
          return renderNumber(data, 2);
        }
      },
      {
        data: 'totalAmount', className: 'text-right',
        render(data, type, row, meta) {
          return renderNumber(data, 2);
        }
      },
      {
        data: 'paymentType', className: 'text-left',
        render(data, type, row, meta) {
          let typeMoney
          if (data == 'INVOICE') {
            typeMoney = 'ออกบิล'
          } else if (data == 'CASH') {
            typeMoney = 'เงินสด'
          }
          return typeMoney;
        }
      },
      {
        data: 'invoiceNo', className: 'text-center',
        render(data, type, full, meta) {
          return Utils.isNull($.trim(data)) ? "-" : data;
        }
      },
      {
        data: 'receiptNo', className: 'text-center',
        render(data, type, full, meta) {
          return Utils.isNull($.trim(data)) ? "-" : data;
        }
      },
      {
        data: 'sapStatus',
        className: 'text-center',
        render(data, type, full, meta) {
          let res = MessageService.SAP.getStatus(data, "sapErr");
          if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
            res += ButtonDatatable.cndn('cndn')
          }
          return res;
        }
      },
      {
        // className: "text-center",
        render: (data, type, full, meta) => {
          let btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.edit('edit')} ${ButtonDatatable.sap('sendToSAP')}`;
          if (!full.reverseBtn) {
            btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.edit('edit', 'แก้ไข', true)} ${ButtonDatatable.sap('sendToSAP', true)}`;
          }
          return btn;
        }
      }
      ]
    });
  }
  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/communi/communi003detail'], {
        queryParams: {
          commuChangeLogoId: data.commuChangeLogoId,
          flag: 'E'
        }
      })
    });

    this.dataTable.on('click', 'td > button#detail', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/communi/communi003detail'], {
        queryParams: {
          commuChangeLogoId: data.commuChangeLogoId,
          flag: 'R'
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapMsgErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDesc));
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data.commuChangeLogoId);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let cndnData: CnDnRequest = {
        id: data.commuChangeLogoId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.COMMUNICATE.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: Number(data.totalAmount),
        glAccount: sapJsonReq.header[0].item[0].account,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/communi/communi003"
        }
      });
    });
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      id: [''],
      customerCode: [''],
      customerName: [''],
      contractNo: [''],
    });
  }
}
