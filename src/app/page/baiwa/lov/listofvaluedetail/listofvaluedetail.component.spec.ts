import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListofvaluedetailComponent } from './listofvaluedetail.component';

describe('ListofvaluedetailComponent', () => {
  let component: ListofvaluedetailComponent;
  let fixture: ComponentFixture<ListofvaluedetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListofvaluedetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListofvaluedetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
