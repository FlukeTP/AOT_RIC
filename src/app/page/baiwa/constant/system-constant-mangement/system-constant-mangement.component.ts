import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
declare var $: any;

const URL = {
  SAVE: "constant/save",
  EDIT: "constant/edit",
  EDIT_LIST: "constant/listdata",
}

@Component({
  selector: 'app-system-constant-mangement',
  templateUrl: './system-constant-mangement.component.html',
  styleUrls: ['./system-constant-mangement.component.css']
})
export class SystemConstantMangementComponent implements OnInit {
  formAddConstant: FormGroup;

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  id: any;
  buttomedit: boolean = true;
  dataEdit: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {

    this.formAddConstant = this.formBuilder.group({
      constantId: ["", Validators.required],
      constantKey: ["", Validators.required],
      constantValue: ["", Validators.required]
    })
  }

  breadcrumb: any = [
    {
      label: "ตั้งค่าข้อมูล",
      link: "/home",
    },
    {
      label: "รายการconstant",
      link: "/components/constant",
    },
    {
      label: "เพิ่มราการconstant",
      link: "#",
    }
  ];

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editFormAddConstant(this.id);
      this.buttomedit = false;
    }
  }

  saveFormAddConstant() {
    console.log("formAddConstant : ", this.formAddConstant.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddConstant.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.router.navigate(['components/constant']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editFormAddConstant(id: any) {
    let constantId = id
    console.log("editFormAddLov : ", constantId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_LIST, { constantId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataEdit = res.data;
        this.formAddConstant.patchValue({
          constantId: this.dataEdit.constantId,
          constantKey: this.dataEdit.constantKey,
          constantValue: this.dataEdit.constantValue
        })
        // this.setDataTo();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editConstant(){
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddConstant.value).subscribe((res: ResponseData<any>) => {
    console.log(res.data);
    if (MessageService.MSG.SUCCESS == res.status) {
      console.log(res.message);
      this.router.navigate(['components/constant']);
    } else {
      console.log(res.message);
    }
    this.commonService.unLoading();
  });
  }


}
