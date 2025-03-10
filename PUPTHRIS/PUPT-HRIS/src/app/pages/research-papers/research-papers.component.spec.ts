import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchPapersComponent } from './research-papers.component';

describe('ResearchPapersComponent', () => {
  let component: ResearchPapersComponent;
  let fixture: ComponentFixture<ResearchPapersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchPapersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResearchPapersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
