import { Component, inject } from '@angular/core';
import { AnswerComponent } from '../answer/answer.components';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'quiz-question',
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  standalone: true,
  imports: [AnswerComponent],
})
export class QuestionComponent {
  quizService = inject(QuizService);
}
