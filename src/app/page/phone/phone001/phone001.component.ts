import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateService } from 'src/app/_service/validate.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Utils } from 'src/app/common/helper/utils';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalReq } from 'src/app/_model/modal.model';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { NumberUtils } from 'src/app/common/helper/number';
import { Router } from '@angular/router';

const URL = {
  SEARCH: "phone001/search",
  DOWNLOAD_TEMPLATE: "phone001/download-template",
  EXPORT: "download-template-info",
  SAVE: "phone001/save",
  UPLOAD_EXCEL: "phone001/upload-excel",
  SYNC_DATA: "phone001/sync-data",
  CHECK_DATA: "phone001/check-sync-data",
  SEND_SAP: "phone001/send-sap",
}

declare var $: any;
@Component({
  selector: 'app-phone001',
  templateUrl: './phone001.component.html',
  styleUrls: ['./phone001.component.css']
})
export class Phone001Component implements OnInit {
  breadcrumb: any = [
    { label: "หมวดโทรศัพท์", link: "/phone" },
    { label: "บันทึกข้อมูลโทรศัพท์", link: "#" },
  ];

  /* modal */
  modalRef: BsModalRef;
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('uploadModal') uploadModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;
  @ViewChild('confirmModal') confirmModal: ModalConfirmComponent;
  @ViewChild('contractNoModal') contractNoModal: BsModalRef;
  @ViewChild('telephoneChargeModal') telephoneChargeModal: BsModalRef;

  /* disabled */
  countSyncData: number = 0;

  /* table */
  table: any = [];
  dataTable: any;
  idxList: any[] = [];
  telephoneCharge: any[] = [];

  /* form */
  formSearch: FormGroup = new FormGroup({});
  submitted: boolean = false;
  file: any[] = [];

  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastr: ToastrService,
    private validate: ValidateService,
    private modalService: BsModalService,
    private router: Router,
    private cndn: CnDnService
  ) { }

  ngOnInit() {
    this.initialVariable();
    this.checkData();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
    this.handleCheckbox();
    this.clickTdButton();
  }

  setDate(e) {
    let dateSplit = e.split("/");
    this.formSearch.get('periodMonth').patchValue(dateSplit[1].concat(dateSplit[0]));
    this.search();
  }

  search() {
    this.idxList = [];
    this.ajax.doPost(URL.SEARCH, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.table = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
      // setTimeout(() => {
      //   this.commonService.unLoading()
      // }, 300);
    });
  }

  confirm(state: string) {
    switch (state) {
      case 'SYNC':
        this.syncModal.openModal();
        break;
      case 'UPLOAD':
        if (this.table.length > 0) {
          let modal: ModalReq = new ModalReq();
          modal.body = 'ข้อมูลในตารางจะถูกแทนที่ด้วยข้อมูลใหม่'
          this.uploadModal.openModal(modal);
        } else {
          this.uploadExcel();
        }
        break;
    }
  }

  syncData() {
    this.commonService.loading();
    this.ajax.doGet(URL.SYNC_DATA).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.checkData();
        this.search();
        this.modalSuccess.openModal();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  checkData() {
    this.commonService.loading();
    this.ajax.doGet(URL.CHECK_DATA).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.countSyncData = response.data;
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  sendToSAP() {
    this.ajax.doPost(URL.SEND_SAP, this.idxList).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        $('#checkAll').prop("checked", false);
        this.search();
        this.modalSuccess.openModal();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  onChangeUpload = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      this.commonService.loading();
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const f = {
          name: event.target.files[0].name,
          type: event.target.files[0].type,
          value: e.target.result
        };
        this.file = [f];
      };
      reader.readAsDataURL(event.target.files[0]);
      setTimeout(() => {
        this.commonService.unLoading();
      }, 150);

    }
  }

  // downloadTemplate() {
  //   this.ajax.download(URL.DOWNLOAD_TEMPLATE);
  // }

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
    this.ajax.download(`${URL.EXPORT}/PHONE001/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  uploadExcel() {
    this.commonService.loading();
    const form = $("#upload-form")[0];
    let formBody = new FormData(form);
    formBody.append("periodMonth", this.formSearch.get('periodMonth').value);
    this.ajax.upload(URL.UPLOAD_EXCEL, formBody, (response) => {
      if (MessageService.MSG.SUCCESS === response.json().status) {
        this.modalSuccess.openModal(response.json().message)
        this.search();
        // this.table = response.json().data;
        // this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
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
          render: function (data, type, row, meta) {
            let str: string = `
            <div class="form-check">
              <input class="form-check-input position-static chk" type="checkbox" aria-label="..." value="chk${row.id}">
            </div>`;
            if (!row.reverseBtn) {
              row.flagCheck = true;
              str = '-';
            }
            return str;
          },
          className: 'text-center'
        },
        {
          render: function (data, type, row, meta) {
            return `${row.entreprenuerCode}-${row.addressCode}`
          },
          className: 'text-center'
        },
        {
          data: 'entreprenuerName',
          render: renderString
        },
        {
          render: function (data, type, row, meta) {
            return `<a id="dtl" style="color: blue">
            ${renderNumber((row.locAmt + row.locSvc + row.lngAmt + row.lngSvc + row.ovsAmt + row.ovsSvc), 2)}
            </a>`;
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.maintenanceCharge, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.serviceEquipmentCharge, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.internalLineCharge, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.outterLineCharge, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.totalCharge, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.vat, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.totalChargeAll, 2);
          },
          className: 'text-right',
        },
        {
          data: 'invoiceNo',
          render: renderString
        },
        {
          data: 'receipt',
          render: renderString
        },
        {
          data: 'sapStatus',
          className: 'text-center',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data);
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
      ]
    });
  }

  checkAll = (e) => {
    let rows = this.dataTable.rows({ search: "applied" }).nodes();
    $('input[type="checkbox"]', rows).prop("checked", e.target.checked);
    let dataInTable = this.dataTable.rows().data();
    if (e.target.checked) {
      for (let i = 0; i < dataInTable.length; i++) {
        if (!dataInTable[i].flagCheck) {
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

  clickTdButton = () => {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;

      if (dataRow) {
        if (id.split("-")[0] === 'sapMsgErr') {
          console.log("PARSE JSON : ", JSON.parse(dataRow.sapError));
          this.modalError.openModal(MessageService.SAP.getMsgErr(dataRow.sapError));
        }
        else if (id.split("-")[0] === 'cndn') {
          let cndnData: CnDnRequest = {
            id: dataRow.id,
            customerCode: dataRow.entreprenuerCode,
            customerName: dataRow.EntreprenuerName,
            customerBranch: dataRow.customerBranch,
            contractNo: dataRow.contractNo,
            oldInvoiceNo: dataRow.invoiceNo,
            oldReceiptNo: dataRow.receipt,
            requestType: REQUEST_TYPE.OTHER.KEY,
            docType: DOC_TYPE_CONSTANT.TELEPHONE.KEY,
            sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
            oldTotalAmount: NumberUtils.decimalFormatToNumber(dataRow.totalChargeAll),
            glAccount: "4105120020",
            oldTransactionNo: dataRow.transactionNo,
          }
          this.cndn.setData(cndnData);
          this.router.navigate(["/cndn/cndn001detail"], {
            queryParams: {
              path: "/phone/phone001"
            }
          });
        }
      }
    });
    this.dataTable.on("click", "a", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;
      this.telephoneCharge = [];
      if (dataRow) {
        this.telephoneCharge.push(dataRow);
        this.modalRef = this.modalService.show(this.telephoneChargeModal, { class: 'modal-lg' });
      }
    });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      periodMonth: ['']
    });
  }

  /* _________________ validate field _________________ */
  validateField(control) {
    return this.submitted && this.formSearch.get(control).invalid;
  }

}
