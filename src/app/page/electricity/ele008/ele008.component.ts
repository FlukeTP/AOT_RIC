import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { IsEmptyPipe } from 'src/app/common/pipes/empty.pipe';
import { Utils } from 'src/app/common/helper';

const URL = {
  GET: "electric008/get",
  EXPORT: "download-template-info"
}

@Component({
  selector: 'app-ele008',
  templateUrl: './ele008.component.html',
  styleUrls: ['./ele008.component.css']
})
export class Ele008Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;

  formData: FormGroup;
  dataList: FormArray = new FormArray([]);
  dataTable: any;

  remarkStr: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formData008();
    this.dataFormList();
  }

  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการคิดค่าไฟฟ้าประเภทต่างๆ",
      link: "#",
    }
  ]
  ngOnInit() {
    this.getData();
  }

  //======================= Form =======================
  formData008() {
    this.formData = this.formBuilder.group({
      dataList: this.formBuilder.array([])
    })
    this.dataList = this.formData.get('dataList') as FormArray;
  }

  dataFormList(): FormGroup {
    return this.formBuilder.group({
      typeConfigId: [''],
      electricType: [''],
      rateType: [''],
      voltageType: [''],
      updatedBy: [''],
      updatedDate: [''],
      description: ['']
    });
  }

  //========================= action ======================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }

  onEdit(id: any) {
    this.router.navigate(["/electricity/ele008detail"], {
      queryParams: {
        id: id
      }
    });
  }

  //=========================== Back - end ======================

  getData() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET, {}).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.initDataTable(res.data);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getExcel() {
    this.commonService.loading();
    this.ajax.download(`${URL.EXPORT}/ELECTRIC008/-}`);
    this.commonService.unLoading();
  }

  // ================= data table ==============
  initDataTable = (data: any[]) => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      columns: [
        {
          data: 'electricType', className: 'text-left'
        }, {
          data: 'rateType', className: 'text-left'
        }, {
          data: 'voltageType', className: 'text-center'
        }, {
          data: 'updatedDate',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        }, {
          data: 'updatedBy',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        },
        {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
        , {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });

    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onClickRemark(data.description);
    });

    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onEdit(data.typeConfigId);
    });

  }

}
