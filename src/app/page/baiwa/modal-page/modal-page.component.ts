import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-modal-page',
  templateUrl: './modal-page.component.html',
  styleUrls: ['./modal-page.component.css']
})
export class ModalPageComponent implements OnInit {

  txtModal = `

  Use
  Import  ComponentsModule  (flie Module.ts)

  Html
  <app-modal [modalId]="'modalId'" [header]="'Modal'">
    <div body>
      content...
    </div>
    <div footer>
      <button-save></button-save>
      <button-cancel (click)="onCancel()"></button-cancel>
    </div>
  </app-modal>

  Ts
  onShowModal() {
    $("#modalId").modal('show')
  }

  onCancel() {
    $("#modalId").modal('hide')
  }

  
  `

  constructor() { }

  ngOnInit() {
  }

  onShowModal() {
    $("#modalId").modal('show')
  }

  onCancel() {
    $("#modalId").modal('hide')
  }

}
