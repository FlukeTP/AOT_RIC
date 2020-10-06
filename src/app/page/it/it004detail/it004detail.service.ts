import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    GET_DROPDOWN: 'lov/list-data-detail',
    GET_SAP_CUT: 'common/getSAPCustumer/',
    GET_SAP_CON_NO: 'common/getSAPContractNo/',
    GET_OTHER_TYPE: 'it0102/get_all',
    SAVE: 'it004/save',
};

@Injectable()
export class It004DetailSrevice {

    constructor(
        private ajax: AjaxService,
    ) { }

    getSapCustomerList(data: any) {
        return this.ajax.doPost(URL.GET_SAP_CUT, data);
    }

    getSapContractNo(partner: string) {
        return this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}`);
    }

    save(formSave: FormGroup) {
        return this.ajax.doPost(URL.SAVE, formSave.value);
    }

    getParams(paramsKey: string) {
        return this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: paramsKey });
    }

    getOtherType() {
        return this.ajax.doPost(URL.GET_OTHER_TYPE, {});
    }

}