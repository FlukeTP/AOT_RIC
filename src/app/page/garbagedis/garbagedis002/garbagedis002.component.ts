import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils, CheckNumber } from 'src/app/common/helper';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { NumberUtils } from 'src/app/common/helper/number';
import { SERVICE_REQUEST_TYPE } from 'src/app/common/constant/garbagedis.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';

const URL = {
  GET_ALL: "garbagedis002/get_all",
  SEND_TO_SAP: 'garbagedis002/sendToSAP',
  EXPORT: "download-template-info",
}
@Component({
  selector: 'app-garbagedis002',
  templateUrl: './garbagedis002.component.html',
  styleUrls: ['./garbagedis002.component.css']
})
export class Garbagedis002Component implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/home/firebrigade",
    },
    {
      label: "ขอใช้บริการกำจัดขยะ",
      link: "#",
    }
  ];

  dataTable: any;
  formGroup: FormGroup;
  formSearch: FormGroup;
  dataList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private cndn: CnDnService
  ) { }
  // ===================== Initial setting ============
  ngOnInit() {
    this.formSearch = this.fb.group({
      customerName: [""],
      contractNo: [""],
      trashLocation: [""],
      serviceType: [""],
    })
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // =============== Action ======================
  dateChange(event) {
    // this.formGroup.get('dateCancel').patchValue(event);
  }

  onSearchCriteria() {
    this.getList();
  }

  // =================== call back-end ===================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe((res: ResponseData<any>) => {
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
    // this.ajax.download(`${URL.EXPORT}/ELECTRIC005/${arrOfId.join(",")}`);
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
        this.getList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  // ==================== data table ================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    console.log("this.commonService.configDataTable", this.commonService.configDataTable);
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'customerName', className: 'text-left'
        }, {
          data: 'contractNo', className: 'text-left'
        }, {
          data: 'trashLocation', className: 'text-left'
        }, {
          data: 'rentalObject', className: 'text-left'
        }, {
          data: 'serviceType', className: 'text-left'
        }, {
          data: 'generalWeight', className: 'text-right',
          render(data, type, full, meta) {
            return NumberUtils.numberToDecimalFormat(data, "###,###");
          }
        }, {
          data: 'hazardousWeight', className: 'text-right',
          render(data, type, full, meta) {
            return NumberUtils.numberToDecimalFormat(data, "###,###");
          }
        }, {
          data: 'infectiousWeight', className: 'text-right',
          render(data, type, full, meta) {
            return NumberUtils.numberToDecimalFormat(data, "###,###");
          }
        }, {
          data: 'startDate', className: 'text-left'
        }, {
          data: 'endDate', className: 'text-left'
        }, {
          data: 'invoiceNo', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          data: 'receiptNo', className: 'text-center',
          render(data, type, full, meta) {
            return Utils.isNull($.trim(data)) ? "-" : data;
          }
        }, {
          className: 'text-center',
          data: 'sapStatus',
          render(data, type, row, meta) {
            let show: String = ''
            if (SERVICE_REQUEST_TYPE.OPERATING_AGREEMENT === row.serviceType) {
              show = "-"
            } else {
              show = MessageService.SAP.getStatus(data, "sapErr");
              if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
                show += ButtonDatatable.cndn('cndn')
              }
            }
            return show;
          }
        }, {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn = '';
            if (Utils.isNull(row.showButton) || SERVICE_REQUEST_TYPE.OPERATING_AGREEMENT === row.serviceType) {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข', true)} ${ButtonDatatable.sap('sendToSAP', true)}`
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
      this.router.navigate(['/garbagedis/garbagedis002detail'], {
        queryParams: {
          garReqId: data.garReqId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(data.sapError);
    });

    this.dataTable.on('click', 'td > button#sendToSAP', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.sendToSAP(data);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let cndnData: CnDnRequest = {
        id: data.garReqId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.GARBAGEDISPOSAL.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: Number(data.totalMoneyAmount) * 1.07,
        glAccount: sapJsonReq.header[0].item[0].account,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/garbagedis/garbagedis002"
        }
      });
    });
  }


}
