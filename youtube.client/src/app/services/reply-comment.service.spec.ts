import { TestBed } from '@angular/core/testing';

import { ReplyCommentService } from './reply-comment.service';

describe('ReplyCommentService', () => {
  let service: ReplyCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplyCommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
