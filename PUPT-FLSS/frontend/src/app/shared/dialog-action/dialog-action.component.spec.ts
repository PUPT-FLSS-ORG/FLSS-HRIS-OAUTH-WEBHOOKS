import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogActionComponent } from './dialog-action.component';

describe('DialogActionComponent', () => {
  let component: DialogActionComponent;
  let fixture: ComponentFixture<DialogActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogActionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
