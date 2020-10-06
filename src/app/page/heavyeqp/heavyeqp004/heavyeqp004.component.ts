import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonService } from "src/app/_service/ common.service";
import { Router } from "@angular/router";
import { AjaxService } from "src/app/_service/ajax.service";
import { ResponseData } from "src/app/common/models/response-data.model";
import { ModalConfirmComponent } from "src/app/components/modal/modal-confirm/modalConfirm.component";

const URL = {
  EXPORT: "download-template-info",
  LIST: "heavyeqp004/list",
};

@Component({
  selector: "app-heavyeqp004",
  templateUrl: "./heavyeqp004.component.html",
  styleUrls: ["./heavyeqp004.component.css"]
})
export class Heavyeqp004Component implements OnInit {
  @ViewChild("modalRemark") modalRemark: ModalConfirmComponent;
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp"
    },
    {
      label: "จัดการประเภทเครื่องทุ่นแรง",
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
  ) { }
  ngOnInit() {
    this.getData();
  }

  initDataTable(data: any[] = null) {
    this.dtOptions = $("#datatable").DataTable({
      ...this.commonService.configDataTable(), deferRender: true,
      columns: [
        {
          data: "glAccount",
          className: "text-center"
        },
        {
          data: "equipmentType",
          className: "text-left"
        },
        {
          data: "detail",
          className: "text-left"
        },
        {
          render: (data, type, full, meta) => {
            let _btn = "";
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit" ><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
      data: data
    });
    this.dtOptions.on("click", "tbody tr button#edit", e => {
      var closestRow = $(e.target).closest("tr");
      var data = this.dtOptions.row(closestRow).data();
      this.clickEdit(data);
    });
  }

  private getData() {
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      this.initDataTable(res.data);
    });
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/EQP004/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  private clickEdit(data) {
    console.log("clickEdit", data);
    this.router.navigate(["/heavyeqp/heavyeqp004detail"], {
      queryParams: { id: data.heavyManageEquipmentTypeId }
    });
  }

}
