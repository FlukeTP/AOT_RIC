import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { MessageService } from 'src/app/_service/message.service';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { Utils } from 'src/app/common/helper/utils';
import { ELECTRIC_CONSTANT } from 'src/app/common/constant/electric.constant';
import { WATER_CONSTANT } from 'src/app/common/constant/water.constants';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { COMMON_CONSTANTS } from 'src/app/common/constant/common.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

declare var $: any;
const URLS = {
  EXPORT: "download-template-info",
  GET_LIST: 'water003/findWaterList',
  SEND_SAP: 'water003/send_sap',
  GET_DROPDOWN: 'lov/list-data-detail',
};
@Component({
  selector: 'app-water003',
  templateUrl: './water003.component.html',
  styleUrls: ['./water003.component.css']
})
export class Water003Component implements OnInit, AfterViewInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;

  formSearch: FormGroup = new FormGroup({});
  dataTable: any;
  dataList: any[] = [];
  datas: any[] = [];

  requestTypeList: any[] = [];

  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private cndn: CnDnService
  ) {
    this.formSearch = this.fb.group({
      customerCode: [''],
      customerName: [''],
      contracNo: [''],
      requestStatus: [''],
      rentalAreaName: [''],
      installPositionService: [''],
      customerType: [''],
      requestType: ['']
    });
  }

  breadcrumb: any = [
    {
      label: 'หมวดน้ำประปา',
      link: '/water',
    }, {
      label: 'ขอใช้น้ำประปาและบริการอื่นๆ',
      link: '#',
    },
  ];

  ngOnInit() { }

  ngAfterViewInit(): void {

    this.getFindList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
    this.getReqType();
  }

  getReqType() {
    this.ajax.doPost(`${URLS.GET_DROPDOWN}`, { lovKey: 'REQUEST_TYPE_WATER' }).subscribe(
      (res: any) => {
        this.requestTypeList = res.data;
      }
    );
  }

  getFindList() {
    this.commonService.loading();
    this.ajax.doPost(URLS.GET_LIST, this.formSearch.value).subscribe(
      (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
        this.commonService.unLoading();
      }, () => {
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
    this.ajax.download(`${URLS.EXPORT}/WATER003/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderNumber = function (number: number, length: number = 0) {
      return Utils.isNull($.trim(number)) ? "-" : $.fn.dataTable.render.number(",", ".", length, "").display(number);
    };

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#dataTable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.datas,
      columns: [
        {
          data: 'requestStartDate', className: 'text-center'
        }, {
          data: 'requestEndDate', className: 'text-center'
        },
        {
          data: 'customerCode', className: 'text-left'
        }, {
          data: 'customerName', className: 'text-left'
        }, {
          data: 'contractNo', className: 'text-center',
          render(data) {
            if (data) {
              return data;
            } else {
              return '-';
            }
          }
        }, {
          data: 'meterSerialNo', className: 'text-center'
        },
        {
          data: 'rentalAreaName',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'installPositionService',
          className: 'text-left',
          render: renderString
        },
        {
          data: 'sumChargeRate', className: 'text-right',
          render(data) {
            if (data) {
              return data;
            } else {
              return '-';
            }
          }
        },
        {
          data: 'invoiceNoCash',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'receiptCash',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            if (row.requestType !== 'ขอใช้เหมาจ่าย' && row.customerType === 'C') {
              let res = MessageService.SAP.getStatus(row.sapStatusCash, "errorCash");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === row.sapStatusCash) {
                res += ButtonDatatable.cndn('cndnCash')
              }
              return res;
            } else {
              return '-';
            }
          }
        },
        {
          data: 'invoiceNoLg',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'receiptLg',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            if (row.requestType !== 'อื่น ๆ' && row.requestType !== 'ขอใช้เหมาจ่าย' && row.customerType === 'C') {
              let res = MessageService.SAP.getStatus(row.sapStatusLg, "errorLg");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === row.sapStatusLg) {
                res += ButtonDatatable.cndn('cndnLg')
              }
              return res;
            } else {
              return '-';
            }
          }
        },
        {
          data: 'invoiceNoPackages',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'receiptPackages',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            if (row.requestType === 'ขอใช้เหมาจ่าย' && row.customerType === 'C') {
              let res = MessageService.SAP.getStatus(row.sapStatusPackages, "errorPk");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === row.sapStatusPackages) {
                res += ButtonDatatable.cndn('cndnPk')
              }
              return res;
            } else {
              return '-';
            }
          }
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = `${ButtonDatatable.detail('detail')}`;
            if ((row.reverseBtnCash || row.reverseBtnLg) && row.customerType === ELECTRIC_CONSTANT.CUSTOMER_TYPE.CUSTOMER) {
              if (row.requestType === WATER_CONSTANT.REQEUST_TYPE.PACKAGE_TH) {
                if (row.reverseBtnPk) {
                  _btn += `
                  ${ButtonDatatable.sap('send-sap')}
                  ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                  `;
                } else {
                  _btn += `
                  ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                  ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                  `;
                }
              } else if (row.requestType === 'อื่น ๆ' && !row.reverseBtnCash) {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                `;
              } else {
                _btn += `
                ${ButtonDatatable.sap('send-sap')}
                ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                `;
              }
            } else if (!(row.reverseBtnCash && row.reverseBtnLg) && row.allBtn) {
              if (row.paymentType === 'เงินสด') {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet')}
                ${ButtonDatatable.cancel('cancel', 'ยกเลิก')}
                `;
              } else {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                `;
              }
            } else {
              _btn += `
                  ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                  ${ButtonDatatable.custom('change', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('cancel', 'ยกเลิก', true)}
                  `;
            }
            return _btn;
          }
        },
      ],
    });
  }

  // event Click button in dataTable
  clickBtn = () => {
    // detail button
    this.dataTable.on('click', 'tbody tr button#detail', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.router.navigate(['/water/water003detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#change', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['water/water008detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#cancel', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['water/water007detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#send-sap', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.ajax.doPost(URLS.SEND_SAP, {
        id: data.reqId,
        reverseCashBtn: data.reverseBtnCash,
        reverseLgBtn: data.reverseBtnLg
      }).subscribe((res: any) => {
        if (MessageService.MSG.SUCCESS === res.status) {
          this.modalSuccess.openModal();
          this.getFindList();
        } else {
          this.modalError.openModal(res.message);
        }
      });
    });

    /* _________________________ modal sap error _________________________ */
    this.dataTable.on('click', 'tbody tr button#errorCash', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescCash));
    });

    this.dataTable.on('click', 'tbody tr button#errorLg', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescLg));
    });

    this.dataTable.on('click', '#errorPk', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescPackages));
    });
    /* ____________________________________________________________________ */
    this.dataTable.on('click', 'tbody tr button', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const { id } = event.currentTarget;
      const sapJsonReqCash = JSON.parse(data.sapJsonReqCash);
      const sapJsonReqPackages = JSON.parse(data.sapJsonReqPackages);
      if (data) {
        switch (id) {
          case "cndnCash":
            let cndnDataCash: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoCash,
              oldReceiptNo: data.receiptNoCash,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.WATER.KEY,
              sapType: SAP_TYPE_CONSTANT.INSTALLATION.KEY,
              oldTotalAmount: Number(data.sumChargeRate),
              glAccount: sapJsonReqCash.header[0].item[0].account,
              oldTransactionNo: data.transactionNoCash,
            }
            this.cndn.setData(cndnDataCash);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/water/water003"
              }
            });
            break;
          case "cndnLg":
            let cndnDataLg: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoLg,
              oldReceiptNo: data.receiptNoLg,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.WATER.KEY,
              sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
              oldTotalAmount: Number(data.sumChargeRate),
              glAccount: "4105110002",
              oldTransactionNo: data.transactionNoLg,
            }
            this.cndn.setData(cndnDataLg);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/water/water003"
              }
            });
            break;
          case "cndnPk":
            let cndnDataPk: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoPackages,
              oldReceiptNo: data.receiptPackages,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.WATER.KEY,
              sapType: SAP_TYPE_CONSTANT.PACKAGES.KEY,
              oldTotalAmount: Number(data.sumChargeRate),
              glAccount: sapJsonReqPackages.header[0].item[0].account,
              oldTransactionNo: data.transactionNoPackages,
            }
            this.cndn.setData(cndnDataPk);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/water/water003"
              }
            });
            break;

          default:
            break;
        }
      }
    });
  }
}
