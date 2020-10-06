import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    SEARCH: 'communicate001/search',
    SEND_TO_SAP: 'communicate001/send-to-sap',
};

@Injectable()
export class Communi001Srevice {
    constructor(private ajax: AjaxService) { }

    search(formSearch: FormGroup) {
        return this.ajax.doPost(URL.SEARCH, formSearch.value);
    }

    sendToSAP(id: number) {
        return this.ajax.doPost(URL.SEND_TO_SAP, id);
    }
}