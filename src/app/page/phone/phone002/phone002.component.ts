import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils } from 'src/app/common/helper/utils';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { MessageService } from 'src/app/_service/message.service';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { NumberUtils } from 'src/app/common/helper/number';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
declare var $: any;

const URLS = {
  EXPORT: "download-template-info",
  GET_LIST: 'phone002/list',
  SEND_SAP: 'phone002/sendToSAP',
  SAVE_RECEIPT_NO: 'phone002/save-receipt-no'
};

@Component({
  selector: 'app-phone002',
  templateUrl: './phone002.component.html',
  styleUrls: ['./phone002.component.css']
})
export class Phone002Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;

  dataTable: any;
  dataList: any[] = [];
  formSearch: FormGroup;

  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private cndn: CnDnService
  ) {
    this.formSearch = this.fb.group({
      entrepreneurName: [""],
      contractNo: [""],
      phoneNo: [""],
      requestStatus: [""],
    })
  }
  breadcrumb: any = [
    {
      label: 'หมวดโทรศัพท์',
      link: '/phone',
    }, {
      label: 'ขอใช้งานเลขหมายโทรศัพท์',
      link: '#',
    },
  ];

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.getFindList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }


  getFindList() {
    this.commonService.loading();
    this.ajax.doPost(URLS.GET_LIST, this.formSearch.value).subscribe(
      (res: ResponseData<any>) => {
        this.dataList = res.data;
        this.initDataTable();
        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formSearch.value).forEach(key => {
      if (this.formSearch.get(key).value !== "") {
        arrOfId.push(this.formSearch.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URLS.EXPORT}/PHONE002/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    const renderNumber = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(data);
    };

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#datatable').DataTable({
      data: this.dataList,
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      columns: [
        {
          data: 'entrepreneurCode', className: 'text-center',
          render: renderString
        },
        {
          data: 'entrepreneurName', className: 'text-center',
          render: renderString
        },
        {
          data: 'contractNo', className: 'text-center',
          render: renderString
        },
        {
          data: 'phoneNo', className: 'text-center',
          render: renderString
        },
        {
          data: 'chargeRates', className: 'text-right', render: renderNumber,
        },
        {
          data: 'vat', className: 'text-right', render: renderNumber,
        },
        {
          data: 'totalChargeRates', className: 'text-right', render: renderNumber,
        },
        {
          data: 'requestStartDate', className: 'text-center',
          render: renderString
        },
        {
          data: 'requestEndDate', className: 'text-center',
          render: renderString
        },
        {
          data: 'requestStatus', className: 'text-center',
          render(data, type, full, meta) {
            // return this.checkDataEmpty(data);
            let text = '-';
            if (data === 'Y') {
              text = '<span class="text-success">ใช้งาน</span>';
            } else if (data === 'N') {
              text = '<span class="text-danger">ไม่ใช้งาน</span>';
            }
            return text;
          }
        },
        {
          data: 'invoiceNoCash', className: 'text-center',
          render: renderString
        },
        {
          data: 'dzdocNoCash', className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          data: 'sapStatusCash',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErrCash");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndnCash')
            }
            return res;
          }
        },
        {
          data: 'invoiceNoLg', className: 'text-center',
          render: renderString
        },
        {
          data: 'dzdocNoLg', className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          data: 'sapStatusLg',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErrLg");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndnLg')
            }
            return res;
          }
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn_dtl = '';
            _btn_dtl += `${ButtonDatatable.detail('detail')}`;
            return _btn_dtl;
          }
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            let btn1 = '';
            if (Utils.isNull(row.showButtonCash) && Utils.isNull(row.showButtonLg)) {
              btn1 = `${ButtonDatatable.sap('sendToSAP', true)}`;
            } else {
              btn1 = `${ButtonDatatable.sap('sendToSAP')}`;
            }

            let btn2 = '';
            if (Utils.isNull(row.sapReturnS)) {
              btn2 = `${ButtonDatatable.cancel('cancelPhone', 'ยกเลิกการใช้โทรศัพท์')}`;
            } else {
              btn2 = `${ButtonDatatable.cancel('cancelPhone', 'ยกเลิกการใช้โทรศัพท์', true)}`;
            }
            return btn1 + " " + btn2;
          }
        }
      ],
    });
  }




  // event Click button in dataTable
  clickBtn() {
    // detail button
    this.dataTable.on('click', 'tbody tr button#detail', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.router.navigate(['/phone/phone002detail'], {
        queryParams: {
          id: data.phoneReqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#cancelPhone', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['phone/phone003detail'], {
        queryParams: {
          id: data.phoneReqId
        }
      });
      this.saveReceipt(data);
    });

    this.dataTable.on('click', 'tbody tr button#sapErrCash', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescCash));
    });

    this.dataTable.on('click', 'tbody tr button#sapErrLg', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescLg));
    });

    this.dataTable.on('click', 'tbody tr button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.commonService.loading();
      this.ajax.doPost(URLS.SEND_SAP, data).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.message) {
          if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
            this.successModal.openModal();
          } else {
            this.modalError.openModal(res.data.message);
          }
          this.getFindList();
        } else {
          this.modalError.openModal(res.message);
        }
        this.commonService.unLoading();
      });
    });

    this.dataTable.on('click', 'tbody tr button', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const { id } = event.currentTarget;
      const sapJsonReqCash = JSON.parse(data.sapJsonReqCash);
      if (data) {
        switch (id) {
          case "cndnCash":
            let cndnDataCash: CnDnRequest = {
              id: data.phoneReqId,
              customerCode: data.entrepreneurCode,
              customerName: data.entrepreneurName,
              customerBranch: data.branchCustomer,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoCash,
              oldReceiptNo: data.receiptNoCash,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.TELEPHONE.KEY,
              sapType: SAP_TYPE_CONSTANT.INSTALLATION.KEY,
              oldTotalAmount: Number(data.totalChargeRates),
              glAccount: sapJsonReqCash.header[0].item[0].account,
              oldTransactionNo: data.transactionNoCash,
            }
            this.cndn.setData(cndnDataCash);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/phone/phone002"
              }
            });
            break;
          case "cndnLg":
            let cndnDataLg: CnDnRequest = {
              id: data.phoneReqId,
              customerCode: data.entrepreneurCode,
              customerName: data.entrepreneurName,
              customerBranch: data.branchCustomer,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoLg,
              oldReceiptNo: data.receiptNoLg,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.TELEPHONE.KEY,
              sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
              oldTotalAmount: Number(data.totalChargeRates),
              glAccount: "4105120020",
              oldTransactionNo: data.transactionNoLg,
            }
            this.cndn.setData(cndnDataLg);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/phone/phone002"
              }
            });
            break;

          default:
            break;
        }
      }
    });
  }


  saveReceipt(data: any) {
    this.ajax.doPost(URLS.SAVE_RECEIPT_NO, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.message) {
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }


}
