import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker/models';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/public_api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateService } from 'src/app/_service/validate.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils } from 'src/app/common/helper';
import { WATER_CONSTANT } from 'src/app/common/constant/water.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { Router } from '@angular/router';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

const URL = {
  SEARCH: "water001/search",
  SERIAL_NO_LIST: "water001/dropdown/serial-no",
  EXPORT: "download-template-info",
  SAVE: "water001/save",
  UPLOAD_EXCEL: "water001/upload-excel",
  SYNC_DATA: "water001/sync-data",
  CHECK_DATA: "water001/check-sync-data",
  SEND_SAP: "water001/send-sap",
}
declare var $: any;
@Component({
  selector: 'app-water001',
  templateUrl: './water001.component.html',
  styleUrls: ['./water001.component.css']
})
export class Water001Component implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/water",
    },
    {
      label: "บันทึกข้อมูลน้ำประปา",
      link: "#",
    },
  ];

  /* modal */
  modalRef: BsModalRef;
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;

  /* calendar */
  bsValue: Date = new Date();
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;

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

  /* datatable */
  dataTable: any;

  /* checkbox */
  idxList: any[] = [];

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
    this.bsConfig = Object.assign({}, {
      minMode: this.minMode
    });

    this.initialVariable();
    this.initDataTable();
    this.getSerialNoList();
    // this.checkData();
  }

  ngAfterViewInit(): void {
    this.search();
    this.handleCheckbox();
    this.clickTdButton();
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

  search() {
    this.idxList = [];
    this.flagDownload = 0;
    this.ajax.doPost(URL.SEARCH, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.table = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
    }, error => {

    }, () => {
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
    });
  }

  save = () => {
    /* validator field require */
    let currentMeterValueList = [];
    for (let i = 0; i < this.table.length; i++) {
      let _currentMeterValue = (<HTMLInputElement>document.getElementById('currentMeterValue' + this.table[i].waterInfoId)).value;
      let _meterDateStr = (<HTMLInputElement>document.getElementById('meterDateStr' + this.table[i].waterInfoId)).value;

      if (_currentMeterValue) {
        if (this.table[i].backwardMeterValue > Number(_currentMeterValue)) {
          return this.toastr.warning(
            "กรุณาตรวจสอบข้อมูล " +
            " Serial No. มิเตอร์: " + this.table[i].serialNoMeter +
            " ค่ามิเตอร์ปัจจุบันต้องมีค่ามากกว่าค่ามิเตอร์ย้อนหลัง"
          );
        }
        // else if (!_meterDateStr) {
        //   return this.toastr.warning(
        //     "กรุณาตรวจสอบวันที่ของ Serial No. มิเตอร์: " + this.table[i].serialNoMeter
        //   );
        // }

        // regular expression to match required date format
        const format = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        // console.log(_meterDateStr);
        if (_meterDateStr != '') {
          if (_meterDateStr.match(format)) {
            let regs = _meterDateStr.split("/");
            let day: number = Number(regs[0]);
            let month: number = Number(regs[1]);
            let year: number = Number(regs[2]);
            // console.log(day);
            // console.log(month);
            // console.log(year);

            // day value between 1 and 31
            if (day < 1 || day > 31) {
              return this.toastr.warning("ตรวจสอบวันที่ 1-31");
            }
            // month value between 1 and 12
            if (month < 1 || month > 12) {
              return this.toastr.warning("ตรวจสอบเดือน 1-12");
            }
            // year > 2019
            if (year > (new Date()).getFullYear()) {
              return this.toastr.warning("ตรวจสอบปี ต้องไม่เกินปี " + new Date().getFullYear());
            }
          }
        } else {
          return this.toastr.warning("รูปแบบวันที่ไม่ถูกต้อง: วว/ดด/ปปปป");
        }
      }

      if (this.table[i].reverseBtn) {
        currentMeterValueList.push({
          waterInfoId: this.table[i].waterInfoId,
          currentMeterValue: _currentMeterValue,
          currentAmount: this.table[i].currentMeterValue ? (<HTMLInputElement>document.getElementById('currentAmount' + this.table[i].waterInfoId)).value : null,
          meterDateStr: (<HTMLInputElement>document.getElementById('meterDateStr' + this.table[i].waterInfoId)).value
        });
      }
    }

    this.ajax.doPost(URL.SAVE, currentMeterValueList).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.search();
        $('#checkAll').prop("checked", false);
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  downloadTemplate() {
    let arrOfId: string[] = [];
    this.table.forEach(element => {
      if (element.reverseBtn) {
        arrOfId.push(element.waterInfoId);
      }
    });
    this.ajax.download(`${URL.EXPORT}/WATER001/${arrOfId.join(",")}`);
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
  //   this.commonService.loading();
  //   this.ajax.doGet(URL.CHECK_DATA).subscribe((response: ResponseData<any>) => {
  //     if (MessageService.MSG.SUCCESS === response.status) {
  //       this.countSyncData = response.data;
  //     } else {
  //       this.modalError.openModal(response.message);
  //     }
  //     this.commonService.unLoading();
  //   });
  // }

  setDate(e) {
    let dateSplit = e.split("/");
    this.formSearch.get('periodMonth').patchValue(dateSplit[1].concat(dateSplit[0]));
  }

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

  openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  onCloseModal() {
    this.modalRef.hide();
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

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.table,
      columns: [
        {
          render: function (data, type, row, meta) {
            let str: string = `
            <div class="form-check">
              <input class="form-check-input position-static chk" type="checkbox" aria-label="..." value="chk${row.waterInfoId}">
            </div>`;
            if (!row.reverseBtn || !row.currentMeterValue) {
              row.flagCheck = true;
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
        // {
        //   render: function (data, type, row, meta) {
        //     return ``;
        //   },
        // },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.backwardMeterValue, 2);
          },
          className: 'text-right',
        },
        {
          className: 'text-center',
          render: function (data, type, row, meta) {
            if (row.reverseBtn) {
              return `<input type="text" class="form-control form-control-sm" placeholder="วว/ดด/ปปปป" id="meterDateStr${row.waterInfoId}" value="${row.meterDateStr}" style="width: 100px" maxlength="10"></div>`;
            } else {
              return `<input type="text" class="form-control form-control-sm" placeholder="วว/ดด/ปปปป" id="meterDateStr${row.waterInfoId}" value="${row.meterDateStr}" style="width: 100px" disabled></div>`;
            }
          },
        },
        {
          render: function (data, type, row, meta) {
            if (row.reverseBtn) {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentMeterValue${row.waterInfoId}"
              aria-label="Small" value="${row.currentMeterValue}">`
            } else {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentMeterValue${row.waterInfoId}"
              aria-label="Small" value="${row.currentMeterValue}" disabled>`
            }
          }
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            if (row.currentMeterValue && row.reverseBtn) {
              return `<input type="number" class="form-control form-control-sm" style="width: 80px !important;" id="currentAmount${row.waterInfoId}"
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
            return renderNumber(row.baseValue, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.treatmentFee, 2);
          },
          className: 'text-right',
        },
        {
          render: function (data, type, row, meta) {
            return renderNumber(row.recycleAmount, 2);
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
            return renderNumber(row.totalChargeRates, 2);
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
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(full.sapStatus);
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === full.sapStatus) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
      ],
      "rowCallback": function (row, data) {
        const bgColor = '#007bff80';
        if (WATER_CONSTANT.FLAG.X === data.waterType1) {
          $('td:eq(9)', row).css('background-color', bgColor);
        }
        if (WATER_CONSTANT.FLAG.X === data.waterType2) {
          $('td:eq(10)', row).css('background-color', bgColor);
        }
        if (WATER_CONSTANT.FLAG.X === data.waterType3) {
          $('td:eq(11)', row).css('background-color', bgColor);
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
        if (!dataInTable[i].flagCheck) {
          this.idxList.push(dataInTable[i].waterInfoId);
        }
      }
    } else {
      this.idxList = [];
    }
  }

  handleCheckbox() {
    this.dataTable.on("click", ".chk", (event) => {
      let data = this.dataTable.row($(event.currentTarget).closest("tr")).data();
      let index = this.idxList.findIndex(obj => obj.waterInfoId == data.waterInfoId);
      if (event.target.checked) {
        /* ________ check data in idxList _______ */
        if (index > -1) {
          this.idxList.splice(index, 1);
        } else {
          this.idxList.push(data.waterInfoId);
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
            id: dataRow.waterInfoId,
            customerCode: dataRow.entreprenuerCode,
            customerName: dataRow.entreprenuerName,
            customerBranch: dataRow.customerBranch,
            contractNo: dataRow.contractNo,
            oldInvoiceNo: dataRow.invoiceNo,
            oldReceiptNo: dataRow.receipt,
            requestType: REQUEST_TYPE.PERMANENT.KEY,
            docType: DOC_TYPE_CONSTANT.WATER.KEY,
            sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
            oldTotalAmount: dataRow.totalChargeRates,
            glAccount: "4105110002",
            oldTransactionNo: dataRow.transactionNo,
          }
          this.cndn.setData(cndnDataLg);
          this.router.navigate(["/cndn/cndn001detail"], {
            queryParams: {
              path: "/water/water001"
            }
          });
        }
      }
    });
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
      submissionDate: [''],
      periodMonth: ['']
    });

    this.formSearch = this.fb.group({
      contractNo: [''],
      entreprenuerName: [''],
      meterName: [''],
      periodMonth: [''],
      serialNoMeter: [''],
      month: ['', Validators.required],
      year: ['', Validators.required],
    });
  }

  /* _________________ validate field _________________ */
  validateField(control) {
    return this.submitted && this.formSearch.get(control).invalid;
  }

}
