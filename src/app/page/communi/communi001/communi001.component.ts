import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from 'src/app/common/helper/utils';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateService } from 'src/app/_service/validate.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Communi001Srevice } from './communi001.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { COMMON_CONSTANTS } from 'src/app/common/constant/common.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
declare var $: any;
@Component({
  selector: 'app-communi001',
  templateUrl: './communi001.component.html',
  styleUrls: ['./communi001.component.css'],
  providers: [Communi001Srevice]
})
export class Communi001Component implements OnInit {
  breadcrumb: any = [
    { label: "หมวดสื่อสาร", link: "/home/communi" },
    { label: "ขอใช้วิทยุมือถือ", link: "#" }
  ];
  /* modal */
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  // @ViewChild('syncModal') syncModal: ModalConfirmComponent;

  /* datatable */
  table: any;
  dataTable: any;

  /* form */
  formSearch = new FormGroup({});
  mobileSerialNoList: FormArray = new FormArray([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private commonService: CommonService,
    private selfService: Communi001Srevice,
    private toastr: ToastrService,
    private validate: ValidateService,
    private modalService: BsModalService,
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
          className: 'text-right',
          render: function (data, type, row, meta) {
            return renderNumber(row.phoneAmount);
          }
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
            return renderNumber(row.totalAll, 2);
          }
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
          data: 'paymentTypeTh',
          render: renderString
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
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErr");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
        {
          data: 'reverseBtn',
          render: (data, type, full, meta) => {
            let btn = `${ButtonDatatable.detail('detail')}`;
            if (data) {
              btn += `
              ${ButtonDatatable.edit('edit')} 
              ${ButtonDatatable.sap('sendSAP')} 
              ${ButtonDatatable.cancel('cancel', 'ยกเลิกการใช้วิทยุมือถือ', true)}`;
            } else {
              if (full.cancelBtn && full.paymentType !== COMMON_CONSTANTS.PAYMENT_TYPE.BANK_GUARANTEE.DESC_EN) {
                btn += `
                ${ButtonDatatable.edit('detail', COMMON_CONSTANTS.WORDING.EDIT_TH, true)} 
                ${ButtonDatatable.sap('sendSAP', true)} 
                ${ButtonDatatable.cancel('cancel', 'ยกเลิกการใช้วิทยุมือถือ')}`;
              } else {
                btn += `
                ${ButtonDatatable.edit('detail', COMMON_CONSTANTS.WORDING.EDIT_TH, true)} 
                ${ButtonDatatable.sap('sendSAP', true)} 
                ${ButtonDatatable.cancel('cancel', 'ยกเลิกการใช้วิทยุมือถือ', true)}`;
              }
            }
            return btn;
          }
        }
      ],
      "createdRow": function (row, data, dataIndex) {
        if (data.flagEndDate === 'X') {
          // $(row).addClass('bg-red');
          $(row).css('background-color', '#f79b9b');
        }
      }
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
            this.modalError.openModal(MessageService.SAP.getMsgErr(dataRow.sapError));
            break;
          case 'cancel':
            this.routeTo('communi/communi002detail', dataRow.id)
            break;
          case 'edit':
            // this.routeTo('communi/communi001detail', dataRow.id,'read')
            this.router.navigate(['communi/communi001detail'], {
              queryParams: {
                id: dataRow.id,
              }
            });
            break;
          case 'detail':
            // this.routeTo('communi/communi001detail', dataRow.id,'read')
            this.router.navigate(['communi/communi001detail'], {
              queryParams: {
                id: dataRow.id,
                read: true,
              }
            });
            break;
          case 'sapErr':
            this.modalError.openModal(dataRow.sapError);
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
              sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
              oldTotalAmount: dataRow.totalAll,
              glAccount: "4105090001",
              oldTransactionNo: dataRow.transactionNo,
            }
            this.cndn.setData(cndnData);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/communi/communi001"
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

  routeTo(path: string, param?) {
    this.router.navigate([path], {
      queryParams: {
        param1: param
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
      mobileSerialNo: [''],
      chargeRates: [''],
      insuranceRates: [''],
      totalChargeRates: [''],
      remark: [''],
      totalChargeAll: [''],
      airport: [''],
      customerBranch: [''],
      requestDateStr: [''],
    });
  }

}
