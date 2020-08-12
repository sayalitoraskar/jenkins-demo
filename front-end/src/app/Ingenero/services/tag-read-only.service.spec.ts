import { TestBed } from '@angular/core/testing';

import { TagReadOnlyService } from './tag-read-only.service';

describe('TagReadOnlyService', () => {
  let service: TagReadOnlyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagReadOnlyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
