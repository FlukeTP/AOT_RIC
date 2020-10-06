import { Component, OnInit, ViewChild } from '@angular/core';
import { Communi002Service } from './communi002.service';
import { CommonService } from 'src/app/_service/ common.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Communi002detailService } from '../communi002detail/communi002detail.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ValidateService } from 'src/app/_service/validate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Utils } from 'src/app/common/helper';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { NumberUtils } from 'src/app/common/helper/number';
declare var $: any;
@Component({
  selector: 'app-communi002',
  templateUrl: './communi002.component.html',
  styleUrls: ['./communi002.component.css'],
  providers: [Communi002Service]
})
export class Communi002Component implements OnInit {
  breadcrumb: any = [
    { label: "หมวดสื่อสาร", link: "/home/communi" },
    { label: "รายการยกเลิกการใช้วิทยุมือถือ", link: "#" },
  ];
  /* modal */
  // @ViewChild('sapModal') sapModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  /* datatable */
  table: any;
  dataTable: any;

  /* form */
  formSearch = new FormGroup({});
  mobileSerialNoList: FormArray = new FormArray([]);

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private selfService: Communi002Service,
    private modalService: BsModalService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private cndn: CnDnService
  ) { }

  ngOnInit() {
    this.initialVariable();
    this.search();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
    this.clickTdButton()
  }

  search() {
    this.selfService.search(this.formSearch).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.table = response.data;
        this.initDataTable();
      } else {

      }
    });
  }

  initDataTable(): void {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderNumber = function (number: number, length: number = 0) {
      return Utils.isNull($.trim(number)) ? "-" : $.fn.dataTable.render.number(",", ".", length, "").display(number);
    };

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.table,
      columns: [
        {
          className: 'text-center',
          data: 'receiptNoReq',
          render: renderString
        },
        {
          className: 'text-center',
          data: 'entreprenuerCode',
          render: renderString
        },
        {
          data: 'entreprenuerName',
          render: renderString
        },
        {
          data: 'contractNo',
          className: 'text-center',
          render: renderString
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.phoneAmount);
          },
          className: 'text-right',
        },
        {
          data: 'cancelDateStr',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'totalChargeRates',
          className: 'text-right'
        },
        {
          data: 'totalAllDF',
          className: 'text-right'
        },
        {
          data: 'invoiceNoCancel',
          render: renderString
        },
        {
          data: 'sapStatusCancel',
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
          className: "text-center",
          render: (data, type, full, meta) => {
            let btn = `${ButtonDatatable.detail('detail')}`;
            if (full.invoiceNoCancel) {
              btn += `${ButtonDatatable.sap('sendSAP', true)}`;
            } else {
              btn += `${ButtonDatatable.sap('sendSAP')}`;
            }
            return btn;
          }
        }
      ]
    });
  }

  clickTdButton() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;

      if (dataRow) {
        switch (id) {
          case 'sendSAP':
            this.sendToSAP(dataRow.id);
            break;
          case 'sapMsgErr':
            this.modalError.openModal(MessageService.SAP.getMsgErr(dataRow.sapErrorCancel));
            break;
          case 'detail':
            this.routeTo('communi/communi002detail', dataRow.id, 'R');
            break;
          case 'sapErr':
            this.modalError.openModal(dataRow.sapErrorCancel);
            break;
          case 'cndn':
            let cndnData: CnDnRequest = {
              id: dataRow.dedicatedInvioceId,
              customerCode: dataRow.entreprenuerCode,
              customerName: dataRow.entreprenuerName,
              customerBranch: dataRow.customerBranch,
              contractNo: dataRow.contractNo,
              oldInvoiceNo: dataRow.invoiceNo,
              oldReceiptNo: dataRow.receiptNo,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.COMMUNICATE.KEY,
              sapType: SAP_TYPE_CONSTANT.REFUND.KEY,
              oldTotalAmount: NumberUtils.decimalFormatToNumber(dataRow.totalAllDF),
              glAccount: "4105090001",
              oldTransactionNo: dataRow.transactionNoCancel,
            }
            this.cndn.setData(cndnData);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/communi/communi002"
              }
            });
            break;
        }
      }
    });
  }

  sendToSAP(id: number) {
    this.selfService.sendToSAP(id).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.search();
        this.modalSuccess.openModal(response.message);
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  // confirm(CASE: string) {
  //   switch (CASE) {
  //     case 'SAP':
  //       this.sapModal.openModal();
  //       break;
  //   }
  // }

  routeTo(path: string, param1?, param2?) {
    this.router.navigate([path], {
      queryParams: {
        param1: param1,
        param2: param2,
      }
    });
  }

  control(control: string) {
    return this.formSearch.get(control);
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      id: [''],
      entreprenuerCode: [''],
      entreprenuerName: [''],
      phoneAmount: [''],
      contractNo: [''],
      mobileSerialNoList: this.fb.array([]),
      mobileSerialNo: [0],
      chargeRates: [''],
      insuranceRates: [''],
      totalChargeRates: [''],
      remark: [''],
      totalChargeAll: [''],
      airport: [''],
      customerBranch: [''],
      cancelDateStr: [''],
    });
  }
}
