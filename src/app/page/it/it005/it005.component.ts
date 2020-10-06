import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { Utils } from 'src/app/common/helper';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT, REQUEST_TYPE, CASH } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';

const URLS = {
  EXPORT: "download-template-info",
  GET_LIST: 'it005/getList',
  GET_ROOM_TYPE_LIST: 'it0103/get_all',
  SEND_SAP: 'it005/sendToSAP',
  GET_PAY_MEN: 'lov/list-data-detail',
};
declare var $: any;
@Component({
  selector: 'app-it005',
  templateUrl: './it005.component.html',
  styleUrls: ['./it005.component.css']
})
export class It005Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการจองห้องฝึกอบรม CUTE",
      link: "#",
    }
  ];
  dataTable: any;
  dataList: any[] = [];
  formSearch = new FormGroup({});
  roomTypeList: any[] = [];
  datas: any[] = [];
  paymentTypeList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService,
    private cndn: CnDnService
  ) {
    this.formSearch = this.fb.group({
      entreprenuerName: [''],
      entreprenuerCode: [''],
      roomType: [''],
      contractNo: ['']
    });
    this.getDropdown();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.getDropdown();
    this.getFindList();
  }

  getFindList() {
    this.commonService.loading();
    this.ajax.doPost(URLS.GET_LIST, {}).subscribe(
      (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
        this.clickBtn();
        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }

  getDropdown() {
    this.ajax.doPost(URLS.GET_ROOM_TYPE_LIST, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.roomTypeList = res.data;
      }
    })

    this.ajax.doPost(`${URLS.GET_PAY_MEN}`, { lovKey: 'PAYMENT_TYPE_IT' }).subscribe(
      (res: any) => {
        this.paymentTypeList = res.data;
      });
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

  // getPayment() {
  //   this.ajax.doPost(`${URLS.GET_PAY_MEN}`, { lovKey: 'PAYMENT_TYPE_IT' }).subscribe(
  //     (res: any) => {
  //       this.paymentTypeList = res.data;
  //     });
  // }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URLS.EXPORT}/IT005/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    let paymentTypeListTemp = this.paymentTypeList;
    const renderPayment = function (data, type, row, meta) {
      let paymentType = '-';
      for (let i = 0; i < paymentTypeListTemp.length; i++) {
        if (data == paymentTypeListTemp[i].descEn1) {
          paymentType = paymentTypeListTemp[i].descTh1;
          return paymentType;
        }
      }
      return paymentType;
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
          data: 'rentalAreaName', className: 'text-left', render: renderString
        },
        {
          data: 'roomType', className: 'text-left', render: renderString
        },
        {
          data: 'reqStartDate', className: 'text-right', render: renderString
        },
        {
          data: 'timeperiod', className: 'text-right', render: renderString
        },
        {
          data: 'paymentType', className: 'text-center', render: renderPayment
        },
        {
          data: 'remark', className: 'text-center', render: renderString
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
            let res: String = "";
            if (row.requestType !== 'ขอใช้เหมาจ่าย') {
              res = MessageService.SAP.getStatus(data, "error");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
                res += ButtonDatatable.cndn('cndn');
              }
            } else {
              res = '-';
            }
            return res;
          }
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn;
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP', true)}`
            } else {
              _btn = `${ButtonDatatable.detail('detail')} ${ButtonDatatable.sap('sendToSAP')}`;
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
      this.router.navigate(['/it/it005detail'], {
        queryParams: {
          itTrainingRoomUsageId: data.itTrainingRoomUsageId
        }
      });
    });

    /* _________________________ modal sap error _________________________ */
    this.dataTable.on('click', '#error', (e) => {
      const closestRow = $(e.target).closest('tr');
      const data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(data.sapError);
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
          this.getFindList();
        } else {
          this.modalError.openModal(res.message);
        }
        this.commonService.unLoading();
      });
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let glAccount = "4105170001";
      if (CASH.CASH_EN === data.paymentType) {
        glAccount = sapJsonReq.header[0].item[0].account
      }
      let cndnData: CnDnRequest = {
        id: data.itTrainingRoomUsageId,
        customerCode: data.entreprenuerCode,
        customerName: data.entreprenuerName,
        customerBranch: data.entreprenuerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.IT.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: Number(data.totalChargeRates) * 1.07,
        glAccount: glAccount,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/it/it005"
        }
      });
    });
  }
}
