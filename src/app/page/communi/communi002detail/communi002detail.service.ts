import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    FIND_BY_ID: 'communicate002/find-by-id',
    UPDATE: 'communicate002/update',
};
@Injectable()
export class Communi002detailService {
    constructor(private ajax: AjaxService, ) { }

    findById(id: number) {
        return this.ajax.doGet(`${URL.FIND_BY_ID}/${id}`);
    }

    update(formGroup: FormGroup) {
        return this.ajax.doPost(URL.UPDATE, formGroup.value);
    }
}