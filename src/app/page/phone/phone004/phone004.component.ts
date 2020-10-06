import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonService } from "src/app/_service/ common.service";
import { Router } from "@angular/router";
import { AjaxService } from "src/app/_service/ajax.service";
import { ResponseData } from "src/app/common/models/response-data.model";
import { MessageService } from "src/app/_service/message.service";
import { DatePipe } from "@angular/common";
import { ModalConfirmComponent } from "src/app/components/modal/modal-confirm/modalConfirm.component";

const URL = {
  EXPORT: "download-template-info",
  SAVE: "phone004/save",
  GET_DROPDOWN: "lov/PHONE_CAL_TYPE",
  LIST: "phone004/get",
  DETAIL: "phone004/detail"
};

@Component({
  selector: "app-phone004",
  templateUrl: "./phone004.component.html",
  styleUrls: ["./phone004.component.css"]
})
export class Phone004Component implements OnInit {
  @ViewChild("modalRemark") modalRemark: ModalConfirmComponent;
  breadcrumb: any = [
    {
      label: "หมวดโทรศัพท์",
      link: "/phone"
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการโทรศัพท์",
      link: "#"
    }
  ];
  dtOptions: any;
  dataList: any;
  remarkStr: any;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private ajax: AjaxService,
    private datePipe: DatePipe
  ) {
    // this.initDataTable();
  }
  ngOnInit() {
    this.getData();
  }

  initDataTable(data: any[] = null) {
    this.dtOptions = $("#datatable").DataTable({
      ...this.commonService.configDataTable(),
      deferRender: true,
      columns: [
        {
          data: "validDate",
          className: "text-center",
          render: (data, type, full, meta) => {
            return this.datePipe.transform(data, "dd/MM/yyyy");
          }
        },
        {
          data: "phoneType",
          className: "text-center"
        },
        {
          data: "serviceType",
          className: "text-center"
        },
        {
          data: "chargeRate",
          className: "text-right"
        },
        {
          data: "updatedDate",
          className: "text-center",
          render: (data, type, full, meta) => {
            return this.datePipe.transform(data, "dd/MM/yyyy");
          }
        },
        {
          data: "updatedBy",
          className: "text-center"
        },
        {
          render: (data, type, full, meta) => {
            let _btn = "";
            _btn += `<button type="button" class="btn btn-info btn-social-icon" id="remark" ><i class="fa fa-search" aria-hidden="true"></i></button>`;
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit" ><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            _btn += `<button type="button" class="btn btn-success btn-social-icon" id="history" ><i class="fa fa-history" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
      data: data
    });

    this.dtOptions.on("click", "tbody tr button#remark", e => {
      var closestRow = $(e.target).closest("tr");
      var data = this.dtOptions.row(closestRow).data().remark;
      this.clickRemark(data);
    });
    this.dtOptions.on("click", "tbody tr button#edit", e => {
      var closestRow = $(e.target).closest("tr");
      var data = this.dtOptions.row(closestRow).data();
      this.clickEdit(data);
    });
    this.dtOptions.on("click", "tbody tr button#history", e => {
      var closestRow = $(e.target).closest("tr");
      var data = this.dtOptions.row(closestRow).data();
      this.clickHistory(data);
    });
  }

  private getData() {
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log("res", res);
      if (MessageService.MSG.SUCCESS === res.status) {
        // this.dtOptions
        // this.dtOptions.data  = res.data;
        // this.initDataTable(res.data);
        // this.dtOptions.data = [{validDate : "asd", phoneType: "sdsd"},{validDate : "asd", phoneType: "sdsd"}];
        // console.log("getData", this.dtOptions.data );
        this.initDataTable(res.data);
      } else {
        console.log(res.message);
      }
    });
    // this.dtOptions.data = [{validDate : "asd", phoneType: "sdsd"},{validDate : "asd", phoneType: "sdsd"}];

    // this.dtOptions.data  = [{validDate : "asdasd"}];
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    this.ajax.download(`${URL.EXPORT}/PHONE004/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  private clickRemark(data) {
    console.log("clickRemark", data);
    this.remarkStr = data;
    this.modalRemark.openModal();
  }
  private clickEdit(data) {
    console.log("clickEdit", data);
    this.router.navigate(["/phone/phone004detail"], {
      queryParams: { id: data.rateConfigId }
    });
  }

  private clickHistory(data) {
    console.log("clickHistory", data);
  }
}
