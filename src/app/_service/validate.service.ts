import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ValidateService {
  constructor(
    private toastr: ToastrService
  ) { }

  public checking(data:any) {
    for (let index = 0; index < data.length; index++) {
        let chceckVal = true;
        data[index].header;
        if(data[index].format == "number"){
          let regExp = /^[0-9]*$/;
          if(!regExp.test(String(data[index].value).toLowerCase()) || !data[index].value){
            chceckVal =  false;
          }
        }if(data[index].format == "decimal"){
          let regExp = /^\d*\.?\d*$/;
          if(!regExp.test(String(data[index].value).toLowerCase()) || !data[index].value){
            chceckVal =  false;
          }
        }else if(data[index].format == "email"){
          let regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if(!regExp.test(String(data[index].value).toLowerCase()) || !data[index].value){
            chceckVal =  false;
          }
        }else{
          if(!data[index].value){
            chceckVal = false;
          }
        }

        if(!chceckVal){
          this.toastr.warning("กรุณาตรวจสอบข้อมูล "+data[index].header);
          return chceckVal;
        }
    }
    return true ;
  }
}
