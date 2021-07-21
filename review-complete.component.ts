import { Component, Input, OnInit } from '@angular/core';
import formatTime from '../../../formatTime';
import ReviewAttempt from '../../../../../../shared/Postgres/reviewAttempt.model';
import { Router } from '@angular/router';
import { LocalStoreService } from '../../../services/local-store/store.service';
import { getTotalTimeFromArray } from '../../../getTotalTimeFromArray';

type SessionEntry = {
  glyph: string,
  keyword: string,
  msTaken: number,
  success: boolean
};

@Component({
  selector: 'app-review-complete',
  templateUrl: './review-complete.component.html',
  styleUrls: ['./review-complete.component.scss']
})
export class ReviewCompleteComponent implements OnInit {
  @Input() sessionTarget: number;
  @Input() sessionLog: ReviewAttempt[];
  summaryLog: SessionEntry[] = [];
  totalTimeTaken: number = 0;
  averageTimeTaken: number = 0;
  formattedTotalTimeTaken: string;
  accuracy: number = 0;

  constructor(
    private router: Router,
    private localStore: LocalStoreService) { }

  async ngOnInit() {
    const storeKanji = await this.localStore.getStoreKanji();
    const sessionTime = getTotalTimeFromArray(this.sessionLog, 'review');
    let correctAnswers = 0;
    this.sessionLog.forEach(review => {
      if (review.success) {
        correctAnswers += 1;
      }
      const currentKanji = storeKanji.find(kanji => kanji.rtk_number === review.kanji_id);
      this.summaryLog.push({
        // TODO factor in imaginaries with custom font when functionality for reviewing them is added
        glyph: currentKanji.glyph,
        keyword: currentKanji.keyword,
        msTaken: review.ms_taken,
        success: review.success
      });
    });

    this.accuracy = (100 / this.sessionLog.length) * correctAnswers;
    this.formattedTotalTimeTaken = formatTime(sessionTime);
    this.totalTimeTaken = sessionTime / 1000;
    this.averageTimeTaken = this.totalTimeTaken / this.sessionTarget;
  }

  async returnToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
