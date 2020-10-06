import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { MessageService } from 'src/app/_service/message.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CheckNumber, Utils } from 'src/app/common/helper';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { SAP_TYPE_CONSTANT, DOC_TYPE_CONSTANT, REQUEST_TYPE } from 'src/app/common/constant/CnDn.constants';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

const URL = {
  GET_ALL: "electric006/get_all",
  FIND_OLD_AND_NEW_METER: 'electric006/find_old_and_new_meter',
  SEND_TO_SAP: 'electric006/sendToSAP',
  EXPORT: "download-template-info",
}

@Component({
  selector: 'app-ele006',
  templateUrl: './ele006.component.html',
  styleUrls: ['./ele006.component.css']
})
export class Ele006Component implements OnInit {
  private modalRef: BsModalRef;
  @ViewChild('detailMeter') modalDetailMeter: ElementRef;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "ขอเปลี่ยนมิเตอร์การใช้ไฟฟ้า",
      link: "#",
    }
  ]

  formGroup: FormGroup;
  form2MeterGroup: FormGroup;

  dataTable: any;
  dataList: any[] = [];


  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router,
    private cndn: CnDnService
  ) {
    this.setFormGroup();
    this.setForm2MeterGroup();
  }

  // ===================== Initial setting ============
  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.formGroup.get('dateChange').patchValue('');
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      customerName: [""],
      contractNo: [""],
      newSerialNo: [""],
      dateChange: [""]
    })
  }

  setForm2MeterGroup() {
    this.form2MeterGroup = this.fb.group({
      oldSerialNo: [''],
      oldMeterName: [''],
      oldMeterType: [''],
      oldMeterLocation: [''],
      oldFunctionalLocation: [''],
      newSerialNo: [''],
      newMeterName: [''],
      newMeterType: [''],
      newMeterLocation: [''],
      newFunctionalLocation: [''],
    })
  }

  // =============== Action ======================
  dateChange(event) {
    this.formGroup.get('dateChange').patchValue(event);
  }

  onSearchCriteria() {
    this.getList();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let checkBtnSAP = (data: any) => {
      return Utils.isNotNull(data);
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'customerCode', className: 'text-left',
          render: renderString
        }, {
          data: 'customerName', className: 'text-left',
          render: renderString
        }, {
          data: 'contractNo', className: 'text-left',
          render: renderString
        }, {
          data: 'voltageType', className: 'text-left',
          render: renderString
        }, {
          data: 'oldSerialNo', className: 'text-left',
          render(data, type, row, meta) {
            return `<span>${data}</span>
            <button type="button" class="btn btn-info btn-social-icon" id="meterDtl">
              <i class="fa fa-search" aria-hidden="true"></i>
            </button>`;
          }
        }, {
          data: 'newSerialNo', className: 'text-left',
          render(data, type, row, meta) {
            return `<span>${data}</span>
            <button type="button" class="btn btn-info btn-social-icon" id="meterDtl">
              <i class="fa fa-search" aria-hidden="true"></i>
            </button>`;
          }
        }, {
          data: 'oldTotalchargeRates', className: 'text-right',
          render(data, type, row, meta) {
            return NumberUtils.numberToDecimalFormat(data);
          }
        }, {
          data: 'dateChange', className: 'text-center',
          render: renderString
        }, {
          data: 'invoiceNoReqcash', className: 'text-center',
          render: renderString
        }, {
          data: 'receiptNoReqcash', className: 'text-center',
          render: renderString
        }, {
          data: 'invoiceNoReqlg', className: 'text-center',
          render: renderString
        }, {
          data: 'receiptNoReqlg', className: 'text-center',
          render: renderString
        }, {
          data: 'invoiceNoCash', className: 'text-center',
          render: renderString
        }, {
          className: 'text-center',
          data: 'sapStatusCash',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErrCash");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndnCash')
            }
            return res;
          }
        }, {
          data: 'invoiceNoLg', className: 'text-center',
          render: renderString
        }, {
          data: 'receiptNoLg', className: 'text-center',
          render: renderString
        }, {
          className: 'text-center',
          data: 'sapStatusLg',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErrLg");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndnLg')
            }
            return res;
          }
        }, {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn = '';
            if (checkBtnSAP(row.receiptNoLg)) {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข', true)} ${ButtonDatatable.sap('sendToSAP', true)}`;
            } else {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข')} ${ButtonDatatable.sap('sendToSAP')}`;
            }
            return _btn;
          }
        }
      ],
    });
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'button#meterDtl', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.findMeter(data);
    });

    this.dataTable.on('click', 'tbody tr button#sapErrCash', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescCash));
    });

    this.dataTable.on('click', 'tbody tr button#sapErrLg', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescLg));
    });

    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/electricity/ele006detail'], {
        queryParams: {
          reqChangeId: data.reqChangeId
        }
      })
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data);
    });

    this.dataTable.on('click', 'tbody tr button', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const { id } = event.currentTarget;
      if (data) {
        switch (id) {
          case "cndnCash":
            let cndnDataCash: CnDnRequest = {
              id: data.reqChangeId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoCash,
              oldReceiptNo: data.receiptNoCash,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
              sapType: SAP_TYPE_CONSTANT.REFUND.KEY,
              oldTotalAmount: data.oldTotalchargeRates,
              glAccount: "4105100002",
              oldTransactionNo: data.transactionNoCash,
            }
            this.cndn.setData(cndnDataCash);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/electricity/ele006"
              }
            });
            break;
          case "cndnLg":
            let cndnDataLg: CnDnRequest = {
              id: data.reqChangeId,
              customerCode: data.customerCode,
              customerName: data.customerName,
              customerBranch: data.customerBranch,
              contractNo: data.contractNo,
              oldInvoiceNo: data.invoiceNoLg,
              oldReceiptNo: data.receiptNoLg,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.ELECTRICITY.KEY,
              sapType: SAP_TYPE_CONSTANT.DEPOSIT.KEY,
              oldTotalAmount: data.oldTotalchargeRates,
              glAccount: "4105100002",
              oldTransactionNo: data.transactionNoLg,
            }
            this.cndn.setData(cndnDataLg);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/electricity/ele006"
              }
            });
            break;

          default:
            break;
        }
      }
    });
  }

  openModalCustom(template: ElementRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  // =================== call back-end ===================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formGroup.value).forEach(key => {
      if (this.formGroup.get(key).value !== "") {
        arrOfId.push(this.formGroup.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/ELECTRIC006/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  findMeter(data: any) {
    console.log("data: ", data);
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_OLD_AND_NEW_METER, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.form2MeterGroup.patchValue({
          oldSerialNo: res.data.oldSerialNo,
          oldMeterName: res.data.oldMeterName,
          oldMeterType: res.data.oldMeterType,
          oldMeterLocation: res.data.oldMeterLocation,
          oldFunctionalLocation: res.data.oldFunctionalLocation,
          newSerialNo: res.data.newSerialNo,
          newMeterName: res.data.newMeterName,
          newMeterType: res.data.newMeterType,
          newMeterLocation: res.data.newMeterLocation,
          newFunctionalLocation: res.data.newFunctionalLocation
        })
        this.openModalCustom(this.modalDetailMeter);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  sendToSAP(data: any) {
    this.commonService.loading();
    this.ajax.doPost(URL.SEND_TO_SAP, data).subscribe((res: ResponseData<any>) => {
      console.log("dfdsf", res);


      if (MessageService.MSG.SUCCESS == res.status) {

        // if (
        //   res.data.messageType === SAP_CONSTANT.STATUS.CONNECTION_FAIL.CONST
        //   || res.data.messageType === SAP_CONSTANT.STATUS.FAIL.CONST
        // ) {
        //   this.modalError.openModal(res.data.message);
        //   this.getList();
        // }

        if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
          this.modalSuccess.openModal();
        } else {
          this.modalError.openModal(res.data.message);
        }
        this.formGroup.get('dateChange').patchValue('');
        this.getList();
        console.log(this.formGroup.value);


      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

}
