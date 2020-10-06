import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Utils } from 'src/app/common/helper';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT, CASH, ONE_TIME } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';

const URLS = {
  EXPORT: "download-template-info",
  GET_LIST: 'it004/getList',
  SEND_SAP: 'it004/sendToSAP',
  SEND_SAP_CANCEL: 'it004/sendToSAPCancel',
  GET_OTHER_TYPE: 'it0102/get_all',
  SAVE: 'it004/save',
};
declare var $: any;
@Component({
  selector: 'app-it004',
  templateUrl: './it004.component.html',
  styleUrls: ['./it004.component.css']
})
export class It004Component implements OnInit {
  @ViewChild('modalEditEndDate') modalEditEndDate: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการ IT อื่นๆ",
      link: "#",
    }
  ];
  dataTable: any;
  dataList: any[] = [];
  formSearch = new FormGroup({});
  datas: any[] = [];
  endDateInfo: string;
  modalRef: BsModalRef;
  formHeader: FormGroup;
  fisrtTime: boolean = true;
  otherTypeList: any[] = [];
  paymentTypeShow: any;
  constructor(
    private ajax: AjaxService,
    private router: Router,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private cndn: CnDnService
  ) {
    this.formHeader = this.fb.group({
      itOtherCreateInvoiceId: [],
      entreprenuerCode: [''],
      entreprenuerName: [''],
      entreprenuerBranch: [''],
      contractNo: [''],
      otherType: [''],
      chargeRatesType: [''],
      chargeRates: [],
      totalAmount: [],
      rentalObject: [''],
      totalChargeRates: [],
      remark: [''],
      airport: [''],
      requestStartDate: [''],
      requestEndDate: [''],

      paymentType: [''],
      bankName: [''],
      bankBranch: [''],
      bankExplanation: [''],
      bankGuaranteeNo: [''],
      bankExpNo: [''],
      serviceType: [''],
    });

    this.formSearch = this.fb.group({
      entreprenuerName: [''],
      entreprenuerCode: [''],
      otherType: [''],
      contractNo: ['']
    });
  }

  ngOnInit() {
    this.getDropdown();
  }

  async ngAfterViewInit() {
    await this.getFindList();
    // this.initDataTable();
    // call Function event Click button in dataTable
    // this.clickBtn();
  }

  search() {
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

  getFindList() {
    this.commonService.loading();
    this.ajax.doPost(URLS.GET_LIST, {}).subscribe(
      async (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
        if (this.fisrtTime) {
          this.clickBtn();
        }
        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }

  getDropdown() {
    this.ajax.doPost(URLS.GET_OTHER_TYPE, {}).subscribe((response: ResponseData<any>) => {
      this.otherTypeList = response.data
    });

  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URLS.EXPORT}/IT004/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    let renderNumberToDecimalFormat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data));
    };

    let renderNumberToNumberFormat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data), '###,###');
    };

    this.dataTable = $('#datatable').DataTable({
      data: this.datas, ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      columns: [
        {
          data: 'entreprenuerName', className: 'text-left', render: renderString
        },
        {
          data: 'entreprenuerCode', className: 'text-left', render: renderString
        },
        {
          data: 'contractNo', className: 'text-center', render: renderString
        },
        {
          data: 'otherType', className: 'text-left', render: renderString
        },
        {
          data: 'chargeRatesType', className: 'text-left', render: renderString
        },
        {
          data: 'chargeRates', className: 'text-right', render: renderNumberToDecimalFormat
        },
        {
          data: 'totalAmount', className: 'text-right', render: renderNumberToNumberFormat
        },
        {
          data: 'totalChargeRates', className: 'text-right', render: renderNumberToDecimalFormat
        },
        {
          data: 'requestStartDate', className: 'text-center', render: renderString
        },
        {
          data: 'requestEndDate', className: 'text-center', render: renderString
        },
        {
          data: 'invoiceNo', className: 'text-center', render: renderString
        },
        {
          data: 'receiptNo', className: 'text-center', render: renderString
        },
        {
          data: 'sapStatus',
          className: 'text-center',
          render(data, type, row, meta) {
            if (row.requestType !== 'ขอใช้เหมาจ่าย') {
              let res = MessageService.SAP.getStatus(row.sapStatus, "error");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
                res += ButtonDatatable.cndn('cndn')
              }
              return res;
            } else {
              return '-';
            }
          }
        },
        {
          data: 'invoiceNoCancel', className: 'text-center', render: renderString
        },
        {
          data: 'sapStatusCancel',
          className: 'text-center',
          render(data, type, row, meta) {
            if (row.requestType !== 'ขอใช้เหมาจ่าย' && row.chargeRatesType == 'ค่าประกัน') {
              return MessageService.SAP.getStatus(row.sapStatusCancel, "errorCancel");
            } else {
              return '-';
            }
          }
        },
        {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn;
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)} ${ButtonDatatable.cancel('cancel', '', true)}`
              if (row.chargeRatesType == 'ค่าประกัน') {
                _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', false)}`
                if (Utils.isNull(row.receiptNo)) {
                  _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', true)}`
                } else if (row.receiptNo == 'N/A') {
                  _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', true)}`
                }
              }
            } else {
              _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP')} ${ButtonDatatable.cancel('cancel', '', true)}`;
              if (row.chargeRatesType == 'ค่าประกัน') {
                _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP')} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', false)}`
                if (Utils.isNull(row.receiptNo)) {
                  _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP')} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', true)}`
                } else if (row.receiptNo == 'N/A') {
                  _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก', true)}`
                }
              }
            }
            return _btn;
          }
        }
      ],
    });
  }

  clickBtn() {
    // detail button
    this.dataTable.on('click', 'tbody tr button#detail', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.router.navigate(['/it/it004detail'], {
        queryParams: {
          itOtherCreateInvoiceId: data.itOtherCreateInvoiceId
        }
      });
    });

    /* _________________________ modal sap error _________________________ */
    this.dataTable.on('click', '#error', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapError));
    });

    this.dataTable.on('click', '#errorCancel', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorCancel));
    });
    /* ____________________________________________________________________ */


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
          this.fisrtTime = false;
          this.getFindList();
        } else {
          this.modalError.openModal(res.message);
        }
        this.commonService.unLoading();
      });
    });
    /* ____________________________________________________________________ */
    this.dataTable.on('click', 'tbody tr button#cancel', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      if (data.paymentType === 'BANK_GUARANTEE') {
        this.paymentTypeShow = 'แบงค์การันตี';
      }
      if (data.paymentType === 'BILLING') {
        this.paymentTypeShow = 'ออกบิล';
      }
      if (data.paymentType === 'CASH') {
        this.paymentTypeShow = 'เงินสด';
      }
      this.pacthValueData(data);
      this.openModalCustom(data.requestEndDate);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let glAccount = "4105170002";
      if (ONE_TIME.ONE_TIME_TH === data.chargeRatesType && CASH.CASH_EN === data.paymentType) {
        glAccount = sapJsonReq.header[0].item[0].account
      }
      let cndnData: CnDnRequest = {
        id: data.itOtherCreateInvoiceId,
        customerCode: data.entreprenuerCode,
        customerName: data.entreprenuerName,
        customerBranch: data.entreprenuerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.IT.KEY,
        sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
        oldTotalAmount: data.totalChargeRates,
        glAccount: glAccount,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/it/it004"
        }
      });
    });
  }

  openModalCustom(text: string) {
    this.endDateInfo = text;
    this.modalRef = this.modalService.show(this.modalEditEndDate, { class: 'modal-xl' });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  beforeSave() {
    this.modalSave.openModal();
  }

  setEndDate(e) {
    this.formHeader.get('requestEndDate').patchValue(e);
  }

  sapCancel() {
    this.onCloseModal()
    this.commonService.loading();
    this.ajax.doPost(URLS.SEND_SAP_CANCEL, this.formHeader.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.message) {
        if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {

          // =========================================== SAVE END DATE ===========================================
          this.ajax.doPost(URLS.SAVE, this.formHeader.value).subscribe((response: ResponseData<any>) => {
            if (MessageService.MSG.SUCCESS === response.status) {
            } else {
              this.modalError.openModal(response.message);
            }
            this.fisrtTime = false;
            this.getFindList();
          });
          // ======================================================================================

          this.successModal.openModal();
        } else {
          this.modalError.openModal(res.data.message);
        }
        this.fisrtTime = false;
        this.getFindList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  pacthValueData(data) {
    this.formHeader.get('itOtherCreateInvoiceId').patchValue(data.itOtherCreateInvoiceId);
    this.formHeader.get('entreprenuerCode').patchValue(data.entreprenuerCode);
    this.formHeader.get('entreprenuerName').patchValue(data.entreprenuerName);
    this.formHeader.get('entreprenuerBranch').patchValue(data.entreprenuerBranch);
    this.formHeader.get('contractNo').patchValue(data.contractNo);
    this.formHeader.get('otherType').patchValue(data.otherType);
    this.formHeader.get('chargeRatesType').patchValue(data.chargeRatesType);
    this.formHeader.get('chargeRates').patchValue(data.chargeRates);
    this.formHeader.get('totalAmount').patchValue(data.totalAmount);
    this.formHeader.get('rentalObject').patchValue(data.rentalObject);
    this.formHeader.get('totalChargeRates').patchValue(data.totalChargeRates);
    this.formHeader.get('remark').patchValue(data.remark);
    this.formHeader.get('airport').patchValue(data.airport);
    this.formHeader.get('requestStartDate').patchValue(data.requestStartDate);

    this.formHeader.get('paymentType').patchValue(data.paymentType);
    this.formHeader.get('bankName').patchValue(data.bankName);
    this.formHeader.get('bankBranch').patchValue(data.bankBranch);
    this.formHeader.get('bankExplanation').patchValue(data.bankExplanation);
    this.formHeader.get('bankGuaranteeNo').patchValue(data.bankGuaranteeNo);
    this.formHeader.get('bankExpNo').patchValue(data.bankExpNo);
    this.formHeader.get('serviceType').patchValue(data.serviceType);

    console.log('this.formHeader', this.formHeader.value);

  }
}
