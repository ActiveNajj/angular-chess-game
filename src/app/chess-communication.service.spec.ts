import { TestBed } from '@angular/core/testing';

import { ChessCommunicationService } from './chess-communication.service';

describe('ChessCommunicationService', () => {
  let service: ChessCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
