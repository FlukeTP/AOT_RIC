import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { CommonService } from 'src/app/_service/ common.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateService } from 'src/app/_service/validate.service';
import { UserService } from 'src/app/_service/user.service.';
import { Utils } from 'src/app/common/helper/utils';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { Router } from '@angular/router';

const URL = {
  SEARCH: "electric001/search",
  SERIAL_NO_LIST: "electric001/dropdown/serial-no",
  EXPORT: "download-template-info",
  SAVE: "electric001/save",
  UPLOAD_EXCEL: "electric001/upload-excel",
  SYNC_DATA: "electric001/sync-data",
  CHECK_DATA: "electric001/check-sync-data",
  SEND_SAP: "electric001/send-sap",
}
declare var $: any;
@Component({
  selector: 'app-ele001',
  templateUrl: './ele001.component.html',
  styleUrls: ['./ele001.component.css']
})
export class Ele001Component implements OnInit {
  /* modal */
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;

  /* disabled */
  disPreviosMonth: boolean = false;
  countSyncData: number = 0;
  flagDownload: number = 0;

  /* form */
  formSearch: FormGroup = new FormGroup({});
  formTable: FormGroup = new FormGroup({});
  submitted: boolean = false;
  table: any[] = [];
  serialNoList: any[] = [];
  file: any[] = [];
  month: string;
  year: string;
  saveList: any[] = [];
  testDate: any;

  /* checkbox */
  dataTable: any;
  idxList: any[] = [];
  // chkAll: boolean = false;
  // idxCheckbox: any[] = [];
  dateNowStr: string = new Date().toLocaleDateString();

  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastr: ToastrService,
    private validate: ValidateService,
    private user: UserService,
    private router: Router,
    private cndn: CnDnService
  ) { }
  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "บันทึกข้อมูลไฟฟ้า",
      link: "#",
    }
  ];

  ngOnInit() {
    this.initialVariable();
    this.initDataTable();
    this.getSerialNoList();
  }

  ngAfterViewInit(): void {
    this.search();
    this.handleCheckbox();
    this.clickTdButton();
  }

  testCalendar(e) {
    this.testDate = e.target.value;
  }

  getSerialNoList() {
    this.commonService.loading();
    this.ajax.doGet(URL.SERIAL_NO_LIST).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.serialNoList = response.data;
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  setDate(e) {
    let dateSplit = e.split("/");
    this.formSearch.get('periodMonth').patchValue(dateSplit[1].concat(dateSplit[0]));
  }

  search() {
    this.flagDownload = 0;
    this.idxList = [];
    this.ajax.doPost(URL.SEARCH, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.table = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
    }, error => { }
      , () => {
        /* check previous month */
        // let currentDate = new Date();
        // this.month = '0' + (currentDate.getMonth() + 1);
        // this.year = currentDate.getFullYear() + '';
        // if ((this.year + this.month) > this.formSearch.get('periodMonth').value) {
        //   this.disPreviosMonth = true;
        // } else {
        //   this.disPreviosMonth = false;
        // }

        /* flag upload */
        this.table.forEach(element => {
          if (element.sapStatus != SAP_CONSTANT.STATUS.SUCCESS.CONST) {
            return this.flagDownload++;
          }
        });
      }
    );
  }

  save = () => {
    /* validator field require */
    let currentMeterValueList = [];
    for (let i = 0; i < this.table.length; i++) {
      let _currentMeterValue = (<HTMLInputElement>document.getElementById('currentMeterValue' + this.table[i].electricInfoId)).value;
      let _meterDateStr = (<HTMLInputElement>document.getElementById('meterDateStr' + this.table[i].electricInfoId)).value;

      if (_currentMeterValue) {
        if (this.table[i].backwardMeterValue > Number(_currentMeterValue)) {
          return this.toastr.warning(
            "กรุณาตรวจสอบข้อมูล " +
            " Serial No. มิเตอร์: " + this.table[i].serialNoMeter +
            " ค่ามิเตอร์ปัจจุบันต้องมีค่ามากกว่าค่ามิเตอร์ย้อนหลัง"
          );
        } else if (!_meterDateStr) {
          return this.toastr.warning(
            "กรุณาตรวจสอบวันที่ของ Serial No. มิเตอร์: " + this.table[i].serialNoMeter
          );
        }
      }

      if (this.table[i].reverseBtn) {
        currentMeterValueList.push({
          electricInfoId: this.table[i].electricInfoId,
          currentMeterValue: _currentMeterValue,
          currentAmount: this.table[i].currentMeterValue ? (<HTMLInputElement>document.getElementById('currentAmount' + this.table[i].electricInfoId)).value : null,
          meterDateStr: (<HTMLInputElement>document.getElementById('meterDateStr' + this.table[i].electricInfoId)).value
        });
      }
    }

    this.ajax.doPost(URL.SAVE, currentMeterValueList).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        $('#checkAll').prop("checked", false);
        this.modalSuccess.openModal();
        this.search();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  downloadTemplate() {
    let arrOfId: string[] = [];
    this.table.forEach(element => {
      if (element.reverseBtn) {
        arrOfId.push(element.electricInfoId);
      }
    });
    this.ajax.download(`${URL.EXPORT}/ELECTRIC001/${arrOfId.join(",")}`);
  }

  uploadExcel() {
    this.commonService.loading();
    const form = $("#upload-form")[0];
    let formBody = new FormData(form);
    this.ajax.upload(URL.UPLOAD_EXCEL, formBody, (res) => {
      if (MessageService.MSG.SUCCESS === res.json().status) {
        this.table = res.json().data;
        this.modalSuccess.openModal();
        this.search();
      } else {
        this.modalError.openModal(MessageService.MSG.FAILED_CALLBACK);
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

  // checkData() {
  //   this.ajax.doGet(URL.CHECK_DATA).subscribe((response: ResponseData<any>) => {
  //     if (MessageService.MSG.SUCCESS === response.status) {
  //       this.countSyncData = response.data;
  //     } else {
  //       this.modalError.openModal(response.message);
  //     }
  //   });
  // }

  syncData() {
    this.ajax.doGet(`${URL.SYNC_DATA}/${this.formSearch.get('periodMonth').value}`).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal(response.message);
      } else {
        this.modalError.openModal(response.message);
      }
    }, err => {
      this.modalError.openModal(MessageService.MSG.FAILED_CALLBACK);
    }, () => {
      this.search();
    });
  }

  /* ______________ checkbox table ______________ */
  // checkAll(e) {
  //   if (e.target.checked) {
  //     this.chkAll = true;
  //     this.table.forEach(element => {
  //       this.idxCheckbox.push(element.electricInfoId);
  //     });
  //   } else {
  //     this.idxCheckbox = [];
  //     this.chkAll = false;
  //   }
  // }

  // checkBox(e, t: any) {
  //   if (e.target.checked) {
  //     this.idxCheckbox.push(t.electricInfoId);
  //   } else {
  //     let idx = this.idxCheckbox.findIndex(obj => obj.electricInfoId == t.electricInfoId);
  //     if (idx > -1) {
  //       this.idxCheckbox.splice(idx, 1);
  //     }
  //   }
  // }
  /* __________________________________________________________ */

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
      data: this.table,
      columns: [
        {
          render: function (data, type, row, meta) {
            let str: string = `
            <div class="form-check">
              <input class="form-check-input position-static chk" type="checkbox" aria-label="...">
            </div>`;
            if (!row.reverseBtn || !row.currentMeterValue) {
              str = '-';
            }
            return str;
          },
          className: 'text-center'
        },
        {
          data: 'contractNo',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'entreprenuerName',
          render: renderString
        },
        {
          data: 'meterName',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'serialNoMeter',
          className: 'text-center',
          render: renderString
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.backwardMeterValue, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.backwardAmount, 2);
          },
          className: 'text-right',
        },
        // {
        //   data: 'meterDateStr',
        //   className: 'text-center',
        //   render: renderString
        // },
        {
          className: 'text-center',
          render: function (data, type, row, meta) {
            if (row.reverseBtn) {
              return `<input type="text" class="form-control form-control-sm" placeholder="วว/ดด/ปปปป" id="meterDateStr${row.electricInfoId}" value="${row.meterDateStr}" style="width: 100px" maxlength="10"></div>`;
            } else {
              return `<input type="text" class="form-control form-control-sm" placeholder="วว/ดด/ปปปป" id="meterDateStr${row.electricInfoId}" value="${row.meterDateStr}" style="width: 100px" disabled></div>`;
            }
          },
        },
        {
          // new DecimalFormatPipe().transform(
          render: function (data, type, row, meta) {
            if (row.reverseBtn) {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentMeterValue${row.electricInfoId}"
              aria-label="Small" value="${row.currentMeterValue}">`
            } else {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentMeterValue${row.electricInfoId}"
              aria-label="Small" value="${row.currentMeterValue}" disabled>`
            }
          }
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            if (row.currentMeterValue && row.reverseBtn) {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentAmount${row.electricInfoId}"
              aria-label="Small" value="${row.currentAmount}">`
            } else {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;"
              aria-label="Small" value="${row.currentAmount}" disabled>`
              // return renderNumber(row.currentAmount, 2);
            }
          }
        },
        {
          render: function (data, type, row, meta) {
            // return row.flagCalPercent === 'Y' ? `<span class="text-danger">${renderNumber(row.calPercent, 2)}</span>` : renderNumber(row.calPercent, 2);
            return renderNumber(row.calPercent, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.energyValue, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.serviceValue, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.baseValue, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.ftValue, 2);
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
            return renderNumber(row.totalAmount, 2);
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
          className: 'text-center',
          render(data, type, row, meta) {
            let res = MessageService.SAP.getStatus(row.sapStatus);
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === row.sapStatus) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
      ],
      "createdRow": function (row, data, dataIndex) {
        if (data.flagCalPercent === 'Y') {
          // $(row).addClass('bg-red');
          $(row).css('background-color', '#f79b9b');
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
      let index = this.idxList.findIndex(obj => obj.electricInfoId == data.electricInfoId);
      if (event.target.checked) {
        /* ________ check data in idxList _______ */
        if (index > -1) {
          this.idxList.splice(index, 1);
        } else {
          this.idxList.push(data.electricInfoId);
        }
      } else {
        this.idxList.splice(index, 1);
      }
    });
  }

  clickTdButton() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;

      if (dataRow) {
        if (id.split("-")[0] === 'sapMsgErr') {
          this.modalError.openModal(MessageService.SAP.getMsgErr(dataRow.sapError));
        } else if (id.split("-")[0] === 'cndn') {
          let cndnDataLg: CnDnRequest = {
            id: dataRow.electricInfoId,
            customerCode: dataRow.entreprenuerCode,
            customerName: dataRow.entreprenuerName,
            customerBranch: dataRow.customerBranch,
            contractNo: dataRow.contractNo,
            oldInvoiceNo: dataRow.invoiceNo,
            oldReceiptNo: dataRow.receipt,
            requestType: REQUEST_TYPE.PERMANENT.KEY,
            docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
            sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
            oldTotalAmount: dataRow.totalAmount,
            glAccount: "4105100003",
            oldTransactionNo: dataRow.transactionNo,
          }
          this.cndn.setData(cndnDataLg);
          this.router.navigate(["/cndn/cndn001detail"], {
            queryParams: {
              path: "/electricity/ele001"
            }
          });
        }
      }
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
    });
  }

  confirm(state: string) {
    switch (state) {
      case 'SAVE':
        this.saveModal.openModal();
        break;
      case 'SYNC':
        this.syncModal.openModal();
        break;
      default:
        break;
    }
  }

  initialVariable() {
    this.formTable = this.fb.group({
      entreprenuerCode: ['', Validators.required],
      entreprenuerName: [''],
      serialNoMeter: [''],
      backwardMeterValue: [''],
      currentMeterValue: [''],
      calPercent: [''],
      baseValue: [''],
      ftValue: [''],
      serviceValue: [''],
      vat: [''],
      totalAmount: [''],
      invoiceNo: [''],
      receiptNo: [''],
      airport: [''],
      submissionDate: ['']
    });

    this.formSearch = this.fb.group({
      entreprenuerName: [''],
      meterName: [''],
      periodMonth: [''],
      serialNoMeter: [''],
      month: ['', Validators.required],
      year: ['', Validators.required],
      contractNo: ['']
    });
  }

  /* _________________ validate field _________________ */
  validateField(control) {
    return this.submitted && this.formSearch.get(control).invalid;
  }

}
