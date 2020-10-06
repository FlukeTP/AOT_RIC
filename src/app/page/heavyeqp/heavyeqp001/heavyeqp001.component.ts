import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonService } from "src/app/_service/ common.service";
import { Router } from "@angular/router";
import { AjaxService } from "src/app/_service/ajax.service";
import { ResponseData } from "src/app/common/models/response-data.model";
import { MessageService } from "src/app/_service/message.service";
import { DatePipe } from "@angular/common";
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalConfirmComponent } from "src/app/components/modal/modal-confirm/modalConfirm.component";
import { DateStringPipe } from 'src/app/common/pipes/date-string.pipe';
import { DecimalFormatPipe } from 'src/app/common/pipes/decimal-format.pipe';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { ModalComponent } from 'src/app/components/modal/modal-normal/modal.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { IsEmptyPipe } from 'src/app/common/pipes';
import { Observable } from 'rxjs';
import { Utils } from 'src/app/common/helper';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT, REQUEST_TYPE, CASH } from 'src/app/common/constant/CnDn.constants';

const URL = {
  EXPORT: "download-template-info",
  LIST: "heavyeqp001/list",
  GET_DROPDOWN_EQP: "heavyeqp002/list",
  SEND_SAP: "heavyeqp001/sendToSAP"
  // DETAIL: "phone004/detail"
};

@Component({
  selector: 'app-heavyeqp001',
  templateUrl: './heavyeqp001.component.html',
  styleUrls: ['./heavyeqp001.component.css']
})
export class Heavyeqp001Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('normalModal') normalModal: ModalComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp",
    },
    {
      label: "รายได้ค่าบริการเครื่องทุ่นแรง",
      link: "#",
    }
  ];

  dtOptions: any;
  dataList: any[] = [];
  dateSearch: any;
  formSearch: any;
  eqplist: any[] = [];
  formGroup: FormGroup;
  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private ajax: AjaxService,
    private datePipe: DatePipe,
    private cndn: CnDnService
  ) {
    this.formGroup = this.fb.group({
      contractNo: [""],
      customerName: [""],
      equipmentType: [""],
      startDate: [""],
      endDate: [""],
    })
    this.formSearch = this.fb.group({
      startDate: [""],
      endDate: [""],
      periodMonth: ['']
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // call Function event Click button in dataTable = clickBtn() after get data list;
    this.getData().subscribe(() => {
      this.clickBtn();
    });
    this.getDropDawn();
    this.initialVariable();
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      startDate: [""],
      endDate: [""],
      periodMonth: ['']
    });
  }

  dateChange(e, name: string) {
    this.formGroup.get(name).patchValue(e);
  }

  dateSearchChange(e, name: string) {
    this.formSearch.get(name).patchValue(e);
  }

  clickSearch() {
    this.getData().subscribe();
  }

  getData(): Observable<any> {
    return new Observable(obs => {
      this.ajax.doPost(URL.LIST, this.formGroup.value).subscribe((res: ResponseData<any>) => {
        console.log("res", res);
        this.dataList = res.data;
        this.initDataTable()
        obs.next();
      });
    })
  }

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
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/EQP001/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax
      .doPost(URL.GET_DROPDOWN_EQP, {})
      .subscribe((res: ResponseData<any>) => {
        this.eqplist = res.data;
        this.commonService.unLoading();
      });
  }

  initDataTable() {
    console.log("table data:: ", this.dataList);
    if (this.dtOptions != null) {
      this.dtOptions.destroy();
    }
    this.dtOptions = $("#datatable").DataTable({
      ...this.commonService.configDataTable(),
      deferRender: true,
      data: this.dataList,
      columns: [
        {
          data: "contractNo",
          className: "text-center"
        },
        {
          data: "customerName",
          className: "text-center"
        },
        {
          data: "equipmentType",
          className: "text-left"
        },
        {
          data: "totalMoney",
          render(data) {
            return new DecimalFormatPipe().transform(data);
          }, className: 'text-right'
        },
        {
          data: 'startDate',
          render(data) {
            return new DateStringPipe().transform(data);
          }, className: 'text-center'
        },
        {
          data: "endDate",
          render(data) {
            return new DateStringPipe().transform(data);
          }, className: 'text-center'
        },
        {
          data: "periodTime",
          className: "text-center"
        },
        {
          data: "responsiblePerson",
          className: "text-left"
        },
        {
          data: "paymentType",
          className: "text-center"
        },
        {
          data: "invoiceNo",
          className: "text-center",
          render(data, type, row, meta) {
            return new IsEmptyPipe().transform(data);
          }
        },
        {
          data: "receiptNo",
          className: "text-center",
          render(data, type, row, meta) {
            return new IsEmptyPipe().transform(data);
          }
        },
        {
          data: 'sapStatus',
          className: 'text-center',
          render(data, type, row, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErr")
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
        {
          render: (data, type, row, meta) => {
            let _btn;
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.sap('sendToSAP', true)}`
            } else {
              _btn = `${ButtonDatatable.sap('sendToSAP')}`;
            }
            return _btn;
          },
          className: "text-center"
        }
      ]
    });
  }

  // event Click button in dataTable
  clickBtn() {
    console.log("clickBtn done!!!");

    this.dtOptions.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dtOptions.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapError));
    });

    this.dtOptions.on('click', 'tbody tr button#sendToSAP', (event) => {
      const data = this.dtOptions.row($(event.currentTarget).closest('tr')).data();
      this.commonService.loading();
      this.ajax.doPost(URL.SEND_SAP, data).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.message) {
          if (res.data.messageType === SAP_CONSTANT.STATUS.SUCCESS.CONST) {
            this.successModal.openModal();
          } else {
            this.modalError.openModal(res.data.message);
          }
          this.getData().subscribe();
        } else {
          this.modalError.openModal(res.message);
        }
        this.commonService.unLoading();
      });
    });

    this.dtOptions.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dtOptions.row($(event.currentTarget).closest('tr')).data();
      const sapJsonReq = JSON.parse(data.sapJsonReq);
      let glAccount = "4105090001";
      if (CASH.CASH_TH === data.paymentType) {
        glAccount = sapJsonReq.header[0].item[0].account
      }
      let cndnData: CnDnRequest = {
        id: data.heavyEquipmentRevenueId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.EQUIPMENT.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: data.totalMoney,
        glAccount: glAccount,
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/heavyeqp/heavyeqp001"
        }
      });
    });
  }

}
