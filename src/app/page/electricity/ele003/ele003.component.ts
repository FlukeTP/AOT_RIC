import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { Utils } from 'src/app/common/helper';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ELECTRIC_CONSTANT } from 'src/app/common/constant/electric.constant';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { COMMON_CONSTANTS } from 'src/app/common/constant/common.constants';
import { WATER_CONSTANT } from 'src/app/common/constant/water.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';

const URLS = {
  GET_LIST: 'electric003/findElec',
  SEND_SAP: 'electric003/send-to-sap',
  EXPORT: "download-template-info",
};
declare var $: any;
@Component({
  selector: 'app-ele003',
  templateUrl: './ele003.component.html',
  styleUrls: ['./ele003.component.css']
})
export class Ele003Component implements OnInit, AfterViewInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;

  formSearch: FormGroup = new FormGroup({});
  dataTable: any;
  dataList: any[] = [];
  datas: any[] = [];
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
      customerType: ['']
    });
  }



  breadcrumb: any = [
    {
      label: 'หมวดไฟฟ้า',
      link: '/home/elec',
    },
    {
      label: 'ขอใช้ไฟฟ้าแบบถาวร/ชั่วคราว',
      link: '#',
    },

  ];

  ngOnInit() { }

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
        this.datas = res.data;
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
    this.ajax.download(`${URLS.EXPORT}/ELECTRIC003/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    // render check number is null or empty
    const renderNumber = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? '-' : $.fn.dataTable.render.number(',', '.', 2, '').display(data);
    };
    this.dataTable = $('#datatable').DataTable({
      data: this.datas, ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      columns: [
        {
          data: 'dateStartReq', className: 'text-center'
        }, {
          data: 'dateEndReq', className: 'text-center'
        },
        {
          data: 'customerCode', className: 'text-left'
        }, {
          data: 'customerName', className: 'text-left'
        },
        {
          data: 'contracNo', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        },
        {
          data: 'meterSerialNo', className: 'text-left'
        },
        {
          data: 'rentalAreaName', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          data: 'installPositionService', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          data: 'sumChargeRates', className: 'text-right', render: renderNumber,
        }, {
          data: 'totalChargeRate', className: 'text-right', render: renderNumber,
        },
        //  {
        //   data: 'requestStatus', className: 'text-center',
        //   render(data) {
        //     // return this.checkDataEmpty(data);
        //     let text = '-';
        //     if (data === 'Y') {
        //       text = '<span class="text-success">ใช้งาน</span>';
        //     } else if (data === 'N') {
        //       text = '<span class="text-danger">ไม่ใช้งาน</span>';
        //     }
        //     return text;
        //   }
        // },
        {
          data: 'invoiceNoCash', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        ,
        {
          data: 'receiptCash', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        ,
        {
          data: 'sapStatusCash',
          className: 'text-center',
          // render(data, type, row, meta) {
          //   if (ELECTRIC_CONSTANT.CUSTOMER_TYPE.EMPLOYEE === row.customerType) {
          //     return '-';
          //   } else {
          //     if (row.requestType !== 'ขอใช้เหมาจ่าย') {
          //       return MessageService.SAP.getStatus(data, "errorCash");
          //     } else {
          //       return '-';
          //     }
          //   }
          // }
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
          data: 'invoiceNoLg', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        ,
        {
          data: 'receiptLg', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        , {
          className: 'text-center',
          data: 'sapStatusLg',
          // render(data, type, row, meta) {
          //   if (ELECTRIC_CONSTANT.CUSTOMER_TYPE.EMPLOYEE === row.customerType) {
          //     return '-';
          //   } else {
          //     return MessageService.SAP.getStatus(data, "errorLg");
          //   }
          // }
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
          data: 'invoiceNoPackages', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        ,
        {
          data: 'receiptPackages', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }
        , {
          className: 'text-center',
          data: 'sapStatusPackages',
          // render(data, type, row, meta) {
          //   if (row.requestType === 'ขอใช้เหมาจ่าย') {
          //     return MessageService.SAP.getStatus(data, "errorPk");
          //   } else {
          //     return '-';
          //   }
          // }
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

            let _btn = '<button class="btn btn-info  btn-sm"  type="button" id="detail"><i class="fa fa-search" aria-hidden="true"></i></button>';
            // if (row.requestType === 'ขอใช้เหมาจ่าย') {
            //   if ((row.reverseBtnPackages || row.reverseBtnLg) && row.customerType === ELECTRIC_CONSTANT.CUSTOMER_TYPE.CUSTOMER) {
            //     _btn += `
            //     ${ButtonDatatable.sap('send-sap', false)} 
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", true)} 
            //     ${ButtonDatatable.change('ele05', "ขอยกเลิกมิเตอร์", true)}
            //     `;
            //   } else if (!(row.reverseBtnPackages && row.reverseBtnLg) && row.allBtn) {
            //     _btn += `
            //     ${ButtonDatatable.sap('send-sap', true)}
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", false)}
            //     ${ButtonDatatable.cancel('ele05', "ขอยกเลิกมิเตอร์", false)}
            //     `;
            //   } else {
            //     _btn += `${ButtonDatatable.sap('send-sap', true)}
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", true)}
            //     ${ButtonDatatable.cancel('ele05', "ขอยกเลิกมิเตอร์", true)}
            //     `;
            //   }
            // } else {
            //   if ((row.reverseBtnCash || row.reverseBtnLg) && row.customerType === ELECTRIC_CONSTANT.CUSTOMER_TYPE.CUSTOMER) {
            //     _btn += `${ButtonDatatable.sap('send-sap', false)} 
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", true)}
            //     ${ButtonDatatable.change('ele05', "ขอยกเลิกมิเตอร์", true)}
            //     `;
            //   } else if (!(row.reverseBtnCash && row.reverseBtnLg) && row.allBtn) {
            //     _btn += `${ButtonDatatable.sap('send-sap', true)} 
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", false)} 
            //     ${ButtonDatatable.cancel('ele05', "ขอยกเลิกมิเตอร์", false)}
            //     `;
            //   } else {
            //     _btn += `
            //     ${ButtonDatatable.sap('send-sap', true)}
            //     ${ButtonDatatable.change('ele06', "ขอเปลี่ยนมิเตอร์", true)}
            //     ${ButtonDatatable.cancel('ele05', "ขอยกเลิกมิเตอร์", true)}`;
            //   }
            // }
            if ((row.reverseBtnCash || row.reverseBtnLg) && row.customerType === ELECTRIC_CONSTANT.CUSTOMER_TYPE.CUSTOMER) {
              if (row.requestType === WATER_CONSTANT.REQEUST_TYPE.PACKAGE_TH) {
                if (row.reverseBtnPackages) {
                  _btn += `
                  ${ButtonDatatable.sap('send-sap')}
                  ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                  `;
                } else {
                  _btn += `
                  ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                  ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                  `;
                }
              } else if (row.requestType === 'อื่น ๆ' && !row.reverseBtnCash) {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                `;
              } else {
                _btn += `
                ${ButtonDatatable.sap('send-sap')}
                ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                `;
              }
            } else if (!(row.reverseBtnCash && row.reverseBtnLg) && row.allBtn) {
              if (row.paymentType === 'เงินสด') {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet')}
                ${ButtonDatatable.cancel('ele05', 'ยกเลิก')}
                `;
              } else {
                _btn += `
                ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                `;
              }
            } else {
              _btn += `
                  ${ButtonDatatable.sap(COMMON_CONSTANTS.WORDING.SAP_TH, true)}
                  ${ButtonDatatable.custom('ele06', 'ขอเปลี่ยนมิเตอร์', 'warning', 'fa fa-retweet', true)}
                  ${ButtonDatatable.cancel('ele05', 'ยกเลิก', true)}
                  `;
            }
            return _btn;
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
      this.router.navigate(['/electricity/ele003detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#ele06', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['electricity/ele006detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#ele05', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['electricity/ele005detail'], {
        queryParams: {
          id: data.reqId
        }
      });
    });

    // this.dataTable.on('click', 'tbody tr button#sapErrorDescCash', (event) => {
    //   const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
    //   this.modalError.openModal(data.sapError);
    // });

    // this.dataTable.on('click', 'tbody tr button#sapErrorDescLg', (event) => {
    //   const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
    //   this.modalError.openModal(data.sapErrorDescLg);
    // });

    // this.dataTable.on('click', 'tbody tr button#sapErrorDescPackages', (event) => {
    //   const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
    //   this.modalError.openModal(data.sapErrorDescPackages);
    // });

    /* _________________________ modal sap error _________________________ */
    this.dataTable.on('click', '#errorCash', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescCash));
    });

    this.dataTable.on('click', '#errorLg', (e) => {
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


    this.dataTable.on('click', 'tbody tr button#send-sap', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.commonService.loading();
      this.ajax.doPost(URLS.SEND_SAP, data).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.message) {
          this.successModal.openModal();
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
      const sapJsonReqPackages = JSON.parse(data.sapJsonReqPackages);
      if (data) {
        switch (id) {
          case "cndnCash":
            let cndnDataCash: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contracNo,
              oldInvoiceNo: data.invoiceNoCash,
              oldReceiptNo: data.receiptCash,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
              sapType: SAP_TYPE_CONSTANT.INSTALLATION.KEY,
              oldTotalAmount: Number(data.totalChargeRate),
              glAccount: sapJsonReqCash.header[0].item[0].account,
              oldTransactionNo: data.transactionNoCash,
            }
            this.cndn.setData(cndnDataCash);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/electricity/ele003"
              }
            });
            break;
          case "cndnLg":
            let cndnDataLg: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contracNo,
              oldInvoiceNo: data.invoiceNoLg,
              oldReceiptNo: data.receiptLg,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
              sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
              oldTotalAmount: Number(data.totalChargeRate),
              glAccount: "4105100002",
              oldTransactionNo: data.transactionNoLg,
            }
            this.cndn.setData(cndnDataLg);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/electricity/ele003"
              }
            });
            break;
          case "cndnPk":
            let cndnDataPk: CnDnRequest = {
              id: data.reqId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contracNo,
              oldInvoiceNo: data.invoiceNoPackages,
              oldReceiptNo: data.receiptPackages,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
              sapType: SAP_TYPE_CONSTANT.PACKAGES.KEY,
              oldTotalAmount: Number(data.totalChargeRate),
              glAccount: sapJsonReqPackages.header[0].item[0].account,
              oldTransactionNo: data.transactionNoPackages,
            }
            this.cndn.setData(cndnDataPk);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/electricity/ele003"
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
