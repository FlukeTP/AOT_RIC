import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    SAVE: 'communicate001/save',
    FIND_BY_ID: 'communicate001/find-by-id',
    FIND_BY_TRANSNO: 'communicate001/find-by-transno',
    GET_CHARGE_RATES_CONFIG: 'communicate001/find-chargerates-config',
    GET_RENTAL_AREA: 'common/getUtilityArea',
};

@Injectable()
export class Communi001DetailSrevice {

    constructor(
        private ajax: AjaxService,
    ) { }

    save(formSave: FormGroup) {
        return this.ajax.doPost(URL.SAVE, formSave.value);
    }

    findById(id: number) {
        return this.ajax.doGet(`${URL.FIND_BY_ID}/${id}`);
    }

    findByTransNo(transNo: number) {
        return this.ajax.doGet(`${URL.FIND_BY_TRANSNO}/${transNo}`);
    }


    getChargeRatesConfig(dateStr: string) {
        return this.ajax.doGet(`${URL.GET_CHARGE_RATES_CONFIG}/${dateStr.trim().split("/").join(".")}`);
    }

}