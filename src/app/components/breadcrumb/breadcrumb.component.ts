import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  shap: string = "#"
  @Input() breadcrumb: any = [

    {
      label: "test",
      link: "/components/buttons",
    },
    {
      label: "test2",
      link: "#",
    },
  ]
  constructor() { }

  ngOnInit() {
  }

}
