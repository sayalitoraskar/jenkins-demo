import { TestBed } from '@angular/core/testing';

import { DiagramValuesService } from './diagram-values.service';

describe('DiagramValuesService', () => {
  let service: DiagramValuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagramValuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
