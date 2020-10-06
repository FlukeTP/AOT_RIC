import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListofvalueComponent } from './listofvalue.component';

describe('ListofvalueComponent', () => {
  let component: ListofvalueComponent;
  let fixture: ComponentFixture<ListofvalueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListofvalueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListofvalueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
