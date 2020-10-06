import { Component, OnInit, ViewChild } from '@angular/core';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { MessageService } from 'src/app/_service/message.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CheckNumber, Utils } from 'src/app/common/helper';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';

const URL = {
  EXPORT: "download-template-info",
  GET_ALL: "phone003/get_all",
  SEND_TO_SAP: 'phone003/sendToSAP',
}

@Component({
  selector: 'app-phone003',
  templateUrl: './phone003.component.html',
  styleUrls: ['./phone003.component.css']
})
export class Phone003Component implements OnInit {

  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "หมวดโทรศัพท์",
      link: "/",
    },
    {
      label: "ขอยกเลิกการใช้โทรศัพท์",
      link: "#",
    }
  ];

  dataTable: any;
  formGroup: FormGroup;
  dataList: any[] = [];

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private cndn: CnDnService
  ) {
    this.setFormGroup();
  }

  // ===================== Initial setting ============
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.formGroup.get('dateCancel').patchValue('');
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      customerName: [""],
      contractNo: [""],
      phoneNo: [""],
      dateCancel: [""]
    })
  }

  // =============== Action ======================
  dateChange(event) {
    this.formGroup.get('dateCancel').patchValue(event);
  }

  onSearchCriteria() {
    this.getList();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };
    // console.log("this.commonService.configDataTable", this.commonService.configDataTable);
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
          data: 'phoneNo', className: 'text-left',
          render: renderString
        }, {
          data: 'totalchargeRates', className: 'text-right',
          render(data, type, row, meta) {
            return NumberUtils.numberToDecimalFormat(data);
          }
        }, {
          data: 'dateCancel', className: 'text-left',
          render: renderString
        }, {
          data: 'invoiceNoReqcash', className: 'text-left',
          render: renderString
        }, {
          data: 'receiptNoReqcash', className: 'text-left',
          render: renderString
        }, {
          data: 'invoiceNoReqlg', className: 'text-left',
          render: renderString
        }, {
          data: 'receiptNoReqlg', className: 'text-left',
          render: renderString
        }, {
          data: 'invoiceNoLg', className: 'text-left',
          render: renderString
        }, {
          className: 'text-center',
          data: 'sapStatusLg',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErrLg");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        }, {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn = '';
            if (Utils.isNull(row.showButton)) {
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
    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/phone/phone003detail'], {
        queryParams: {
          phoneCancelId: data.phoneCancelId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErrLg', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapErrorDescLg));
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      let cndnData: CnDnRequest = {
        id: data.phoneCancelId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNoLg,
        oldReceiptNo: data.receiptNoLg,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.TELEPHONE.KEY,
        sapType: SAP_TYPE_CONSTANT.REFUND.KEY,
        oldTotalAmount: data.totalchargeRates,
        glAccount: "4105120020",
        oldTransactionNo: data.transactionNoLg,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/phone/phone003"
        }
      });
    });
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
    this.ajax.download(`${URL.EXPORT}/PHONE003/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  sendToSAP(data: any) {
    this.commonService.loading();
    this.ajax.doPost(URL.SEND_TO_SAP, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
          this.modalSuccess.openModal();
        } else {
          this.modalError.openModal(res.data.message);
        }
        this.formGroup.get('dateCancel').patchValue('');
        this.getList();
        // console.log(this.formGroup.value);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

}
