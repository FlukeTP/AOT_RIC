import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Pos001detailComponent } from './pos001detail.component';

describe('Pos001detailComponent', () => {
  let component: Pos001detailComponent;
  let fixture: ComponentFixture<Pos001detailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Pos001detailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Pos001detailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
