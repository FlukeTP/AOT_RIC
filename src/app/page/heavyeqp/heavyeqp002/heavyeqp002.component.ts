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
  LIST: "heavyeqp002/list",
  DETAIL: "phone004/detail"
};

@Component({
  selector: "app-heavyeqp002",
  templateUrl: "./heavyeqp002.component.html",
  styleUrls: ["./heavyeqp002.component.css"]
})
export class Heavyeqp002Component implements OnInit {
  @ViewChild("modalRemark") modalRemark: ModalConfirmComponent;
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp"
    },
    {
      label: "จัดดารเครื่องทุ่นแรง",
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
    console.log("data: ", data);

    this.dtOptions = $("#datatable").DataTable({
      ...this.commonService.configDataTable(),
      deferRender: true,
      columns: [
        {
          data: "equipmentCode",
          className: "text-center"
        },
        {
          data: "equipmentType",
          className: "text-left"
        },
        {
          data: "equipmentNo",
          className: "text-center"
        },
        {
          data: "numberLicensePlate",
          className: "text-center"
        },
        {
          data: "licensePlate",
          className: "text-center"
        },
        {
          data: "status",
          className: "text-center",
          render: (data, type, full, meta) => {
            let dataout
            if (data == "ซ่อมบำรุง") {
              dataout = "<a style='color: orange'>ซ่อมบำรุง</a>"
            } else if (data == "ใช้งาน") {
              dataout = "<a style='color: green'>ใช้งาน</a>"
            } else if (data == "ไม่ใช้งาน") {
              dataout = "<a style='color: red'>ไม่ใช้งาน</a>"
            }
            return dataout;
          }
        },
        {
          data: "responsiblePerson",
          className: "text-left"
        },
        {
          render: (data, type, full, meta) => {
            let _btn = "";
            _btn += `<button type="button" class="btn btn-info btn-social-icon" id="remark" ><i class="fa fa-search" aria-hidden="true"></i></button>`;
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit" ><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
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
  }

  private getData() {
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log("res", res);
      this.initDataTable(res.data);
    });
    // this.dtOptions.data = [{validDate : "asd", phoneType: "sdsd"},{validDate : "asd", phoneType: "sdsd"}];

    // this.dtOptions.data  = [{validDate : "asdasd"}];
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/EQP002/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  private clickRemark(data) {
    console.log("clickRemark", data);
    this.remarkStr = data;
    this.modalRemark.openModal();
  }
  private clickEdit(data) {
    console.log("clickEdit", data);
    this.router.navigate(["/heavyeqp/heavyeqp002detail"], {
      queryParams: { id: data.manageHeavyEquipmentId }
    });
  }

}
