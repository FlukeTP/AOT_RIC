import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { DecimalFormatPipe } from 'src/app/common/pipes/decimal-format.pipe';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Router } from '@angular/router';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { MessageService } from 'src/app/_service/message.service';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils } from 'src/app/common/helper';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { COMMON_CONSTANTS } from 'src/app/common/constant/common.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';


declare var $: any;
const URL = {
  EXPORT: "download-template-info",
  LIST: "water009/list",
  GET_DTL_BY_ID: "water009/get-dtl-by-id",
  SAP: "water009/sendToSAP"
}
@Component({
  selector: 'app-water009',
  templateUrl: './water009.component.html',
  styleUrls: ['./water009.component.css']
})

export class Water009Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;

  dataList: any[] = [];
  datas: any[] = [];
  dataTable: any;
  tableDtl: any;
  remarkStr: string = '';

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router,
    private cndn: CnDnService
  ) {

  }

  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/water",
    },
    {
      label: "ค่าปรับน้ำเสีย",
      link: "#",
    },

  ];
  ngOnInit() {
    this.dataTableDtl();
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  //================== action =================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }
  onEdit(id: any) {
    this.router.navigate(["/water/water009detail"], {
      queryParams: {
        id: id
      }
    });
  }
  //=================== call back-end ==================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.length > 0) {
          this.dataList = res.data;
        } else {
          this.dataList = [];
        }
      } else {
        this.dataList = [];
        this.modalError.openModal(res.message);
      }
      this.initDataTable();
      this.commonService.unLoading();
    });
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/WATER009/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  sentSap(id: number) {
    this.commonService.loading();
    this.ajax.doPost(URL.SAP, id).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal(res.message);
        this.getList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  //======================== table ======================
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
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'customerCode',
          className: 'text-left',
          render: renderString
        },
        {
          data: 'customerName',
          className: 'text-left',
          render: renderString
        },
        {
          data: 'contractNo',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'rentalAreaName',
          className: 'text-left',
          render: renderString
        },
        {
          data: 'date',
          className: 'text-center'
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
        // {
        //   render: (data, type, row, meta) => {
        //     let _btn = '';

        //     _btn = `
        //     <button type="button" class="btn btn-success btn-sm" id="sendToSAP"><i class="fa fa-share-square-o"></i></button>
        //     <button type="button" class="btn btn-warning btn-sm" id="edit"><i class="fa fa-pencil-square-o"></i></button>
        //     <button type="button" class="btn btn-info btn-sm" id="remark"><i class="fa fa-tint"></i></button>
        //     `;
        //     return _btn;
        //   },
        //   className: "text-center"
        // }
        {
          data: 'reverseBtn',
          render: (data, type, full, meta) => {
            let btn = `${ButtonDatatable.detail('remark', 'ค่าความสกปรก')}`;
            if (data) {
              btn += `
              ${ButtonDatatable.edit('edit')} 
              ${ButtonDatatable.sap('sendToSAP')}
              `;
            } else {
              btn += `
              ${ButtonDatatable.edit('edit', 'แก้ไข', true)} 
              ${ButtonDatatable.sap('sendToSAP', true)}
              `;
            }
            return btn;
          }
        }
      ],
    });

  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      // this.onClickRemark(data.remark);
      this.getDataDtl(data.wasteHeaderId);
    });

    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onEdit(data.wasteHeaderId);
    });


    this.dataTable.on('click', 'tbody tr button#sapErr', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapError));
    });

    this.dataTable.on('click', 'tbody tr button#sendToSAP', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.sentSap(data.wasteHeaderId);
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      let cndnData: CnDnRequest = {
        id: data.wasteHeaderId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.WATER.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: data.netAmount,
        glAccount: "4105110002",
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/water/water009"
        }
      });
    });
  }

  getDataDtl(id: any) {
    console.log(id);
    this.ajax.doGet(`${URL.GET_DTL_BY_ID}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        this.datas = res.data;
        setTimeout(() => {
          this.dataTableDtl();
        }, 200);

      } else {
        this.modalError.openModal(res.message);
      }
    });
    this.showModal();
  }

  showModal() {
    $('#myModal').modal('show');
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

  dataTableDtl = () => {
    if (this.tableDtl != null) {
      this.tableDtl.destroy();
    }
    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.tableDtl = $('#datatable2').DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.datas,
      columns: [
        {
          data: 'serviceType',
          className: 'text-left',
          render: renderString
        },
        {
          data: 'unit',
          render(data) {
            return new DecimalFormatPipe().transform(data);
          }, className: 'text-right'
        },
        {
          data: 'amount',
          render(data) {
            return new DecimalFormatPipe().transform(data);
          }, className: 'text-right'
        },
      ],
    });
  }

}
