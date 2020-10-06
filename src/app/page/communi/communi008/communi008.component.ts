import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { Communi008Srevice } from './communi008.service';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { Router } from '@angular/router';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { NumberUtils } from 'src/app/common/helper/number';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

@Component({
  selector: 'app-communi008',
  templateUrl: './communi008.component.html',
  styleUrls: ['./communi008.component.css'],
  providers: [Communi008Srevice]
})
export class Communi008Component implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "รายการบริการข้อมูลตารางการบินรายเดือน",
      link: "#",
    }
  ];

  /* modal */
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;
  @ViewChild('calendar1') calendar1: InputCalendarComponent;

  /* disabled */
  disPreviosMonth: boolean = false;
  countSyncData: number = 0;

  /* form */
  formSearch: FormGroup = new FormGroup({});
  table: any[] = [];
  serialNoList: any[] = [];

  /* checkbox */
  dataTable: any;
  idxList: any[] = [];
  // chkAll: boolean = false;
  idxCheckbox: any[] = [];
  dateNowStr: string = new Date().toLocaleDateString();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private selfService: Communi008Srevice,
    private cndn: CnDnService
  ) { }

  ngOnInit() {
    this.initialVariable();
    this.initDataTable();
  }

  ngAfterViewInit(): void {
    this.search();
    // this.initDataTable();
    this.clickBtn();
    this.handleCheckbox()
  }

  syncData() {
    this.selfService.syncData(this.formSearch.get('periodMonth').value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal(response.message);
        this.search();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  search() {
    this.idxList = []; /* default value */
    this.selfService.search(this.formSearch).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.table = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  initDataTable(): void {
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
      data: this.table,
      columns: [
        {
          render: function (data, type, row, meta) {
            let str: string = `
            <div class="form-check">
              <input class="form-check-input position-static chk" type="checkbox" aria-label="...">
            </div>`;
            if (!row.reverseBtn) {
              str = '-';
            }
            return str;
          },
          className: 'text-center'
        },
        {
          data: 'transactionReq',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'contractNo',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'entreprenuerCode',
          render: renderString
        },
        {
          data: 'entreprenuerName',
          render: renderString
        },
        {
          data: 'requestDateStr',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'endDateStr',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            return renderNumber(row.totalChargeRates, 2);
          }
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            return renderNumber(row.vat, 2);
          }
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            return renderNumber(row.totalAll, 2);
          }
        },
        {
          data: 'invoiceNo',
          render: renderString
        },
        {
          data: 'receiptNo',
          render: renderString
        },
        {
          data: 'sapStatus',
          className: 'text-center',
          render(data, type, row, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErr");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
        {
          render: (data, type, full, meta) => {
            return `${ButtonDatatable.detail('detail')}`;
          }
        }
      ],
      "createdRow": function (row, data: any, dataIndex) {
        if (data.flagEndDate === 'X') {
          $(row).css('background-color', '#f79b9b');
        }
      }
    });
  }

  clickBtn() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;
      if (dataRow) {
        switch (id) {
          case 'detail':
            this.router.navigate(['/communi/communi004detail'], {
              queryParams: {
                transReq: dataRow.transactionReq,
                flag: 'C',
              }
            });
            break;
          case 'cndn':
            let cndnData: CnDnRequest = {
              id: dataRow.id,
              customerCode: dataRow.entreprenuerCode,
              customerName: dataRow.entreprenuerName,
              customerBranch: dataRow.customerBranch,
              contractNo: dataRow.contractNo,
              oldInvoiceNo: dataRow.invoiceNo,
              oldReceiptNo: dataRow.receiptNo,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.COMMUNICATE.KEY,
              sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
              oldTotalAmount: NumberUtils.decimalFormatToNumber(dataRow.totalAll),
              glAccount: "4105090001",
              oldTransactionNo: dataRow.transactionReq,
            }
            this.cndn.setData(cndnData);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/communi/communi008"
              }
            });
            break;
        }
      }
    });
  }

  checkAll = (e) => {
    let rows = this.dataTable.rows({ search: "applied" }).nodes();
    $('input[type="checkbox"]', rows).prop("checked", e.target.checked);
    let dataInTable = this.dataTable.rows().data();
    if (e.target.checked) {
      for (let i = 0; i < dataInTable.length; i++) {
        /* ____________ check reverse 'X'? or send sap success? ____________ */
        if (dataInTable[i].reverseBtn) {
          this.idxList.push(dataInTable[i].id);
        }
      }
    } else {
      this.idxList = [];
    }
  }

  handleCheckbox() {
    this.dataTable.on("click", ".chk", (event) => {
      let data = this.dataTable.row($(event.currentTarget).closest("tr")).data();
      let index = this.idxList.findIndex(obj => obj.id == data.id);
      if (event.target.checked) {
        /* ________ check data in idxList _______ */
        if (index > -1) {
          this.idxList.splice(index, 1);
        } else {
          this.idxList.push(data.id);
        }
      } else {
        this.idxList.splice(index, 1);
      }
    });
  }

  confirm(state: string) {
    switch (state) {
      case 'SYNC':
        this.syncModal.openModal();
        break;
    }
  }

  setDate(e) {
    let dateSplit = e.split("/");
    this.formSearch.get('periodMonth').patchValue(dateSplit[1].concat(dateSplit[0]));
  }


  sendToSAP() {
    this.selfService.sendTosap(this.idxList).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        $('#checkAll').prop("checked", false);
        this.search();
        this.modalSuccess.openModal();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      id: [null],
      periodMonth: [''],
      entreprenuerCode: [''],
      entreprenuerName: [''],
      phoneAmount: [0],
      contractNo: [''],
      requestDateStr: [''],
      endDateStr: [''],
      roName: [''],
      roNumber: [''],
    });
  }

}
