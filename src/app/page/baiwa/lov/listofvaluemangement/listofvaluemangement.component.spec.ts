import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListofvaluemangementComponent } from './listofvaluemangement.component';

describe('ListofvaluemangementComponent', () => {
  let component: ListofvaluemangementComponent;
  let fixture: ComponentFixture<ListofvaluemangementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListofvaluemangementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListofvaluemangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
