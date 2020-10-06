import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Utils } from 'src/app/common/helper';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { NumberUtils } from 'src/app/common/helper/number';
declare var $: any;

const URL = {
  GET_LIST: 'communicate005/list',
  SEND_TO_SAP: 'communicate005/send-to-sap',
  // EXPORT: "download-template-info",
};
@Component({
  selector: 'app-communi005',
  templateUrl: './communi005.component.html',
  styleUrls: ['./communi005.component.css']
})
export class Communi005Component implements OnInit {
  /* modal */
  // @ViewChild('sapModal') sapModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  /* form */
  formSearch = new FormGroup({});
  dataTable: any;
  datas: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private cndn: CnDnService
  ) { }
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "รายการยกเลิกการใช้บริการข้อมูลตารางการบิน",
      link: "#",
    },

  ];
  ngOnInit() {
    this.initialVariable();
    this.search();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
    this.clickBtn();
  }

  search() {
    this.ajax.doPost(URL.GET_LIST, this.formSearch.value).subscribe(
      (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
      },
      (err) => {
      }
    );
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
      data: this.datas, ...this.commonService.configDataTable(),
      ...{ scrollX: false },
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
        // {
        //   data: 'rentalAreaName',
        //   className: 'text-center',
        //   render: renderString
        // },
        {
          data: 'endDateStr',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-right',
          render: function (data, type, row, meta) {
            return renderNumber(row.amountLg, 2);
          }
        },
        {
          data: 'totalAllDF',
          className: 'text-right',
          render: renderString
        },
        {
          data: 'invoiceNoCancel',
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

  clickBtn() {
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
          case 'detail':
            this.router.navigate(['/communi/communi005detail'], {
              queryParams: {
                id: dataRow.id,
                flag: 'R'
              }
            });
            break;
          case 'cndn':
            let cndnData: CnDnRequest = {
              id: dataRow.id,
              customerCode: dataRow.entreprenuerCode,
              customerName: dataRow.entreprenuerName,
              customerBranch: dataRow.customerBranch,
              contractNo: dataRow.contractNo,
              oldInvoiceNo: dataRow.invoiceNoCancel,
              oldReceiptNo: dataRow.receiptNoReq,
              requestType: REQUEST_TYPE.OTHER.KEY,
              docType: DOC_TYPE_CONSTANT.COMMUNICATE.KEY,
              sapType: SAP_TYPE_CONSTANT.REFUND.KEY,
              oldTotalAmount: NumberUtils.decimalFormatToNumber(dataRow.totalAllDF),
              glAccount: "4105090001",
              oldTransactionNo: dataRow.transactionNo,
            }
            this.cndn.setData(cndnData);
            this.router.navigate(["/cndn/cndn001detail"], {
              queryParams: {
                path: "/communi/communi005"
              }
            });
            break;
        }
      }
    });
  }

  sendToSAP(id: number) {
    this.ajax.doPost(URL.SEND_TO_SAP, id).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.search();
        this.modalSuccess.openModal(response.message);
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      entreprenuerCode: [''],
      contractNo: [''],
    });
  }

}
