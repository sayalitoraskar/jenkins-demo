import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagMappingComponent } from './tag-mapping.component';

describe('TagMappingComponent', () => {
  let component: TagMappingComponent;
  let fixture: ComponentFixture<TagMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
