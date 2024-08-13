import { computed, inject, Injectable, signal } from '@angular/core';
import { QuestionInterface } from '../types/question.interface';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BackendQuestionInterface } from '../types/backendQuestion.interface';

@Injectable({ providedIn: 'root' })
export class QuizService {
  http = inject(HttpClient);
  questions = signal<QuestionInterface[]>([]);
  currentQuestionIndex = signal<number>(0);
  currentAnswer = signal<string | null>(null);
  correctAnswersCount = signal<number>(0);
  currentQuestion = computed(
    () => this.questions()[this.currentQuestionIndex()]
  );
  showResults = computed(
    () => this.currentQuestionIndex() === this.questions().length - 1
  );

  currentQuestionAnswers = computed(() =>
    this.shuffleAnswers(this.currentQuestion())
  );

  shuffleAnswers(question: QuestionInterface): string[] {
    const unShuffledAnswers = [
      question.correctAnswer,
      ...question.incorrectAnswers,
    ];

    return unShuffledAnswers
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  selectAnswer(answerText: string): void {
    this.currentAnswer.set(answerText);
    const correctAnswersCount =
      answerText === this.currentQuestion().correctAnswer
        ? this.correctAnswersCount() + 1
        : this.correctAnswersCount();
    this.correctAnswersCount.set(correctAnswersCount);
  }

  goToNextQuestion(): void {
    const currentQuestionIndex = this.showResults()
      ? this.currentQuestionIndex()
      : this.currentQuestionIndex() + 1;
    this.currentQuestionIndex.set(currentQuestionIndex);
    this.currentAnswer.set(null);
  }

  restart(): void {
    this.currentQuestionIndex.set(0);
  }

  getQuestions(): Observable<QuestionInterface[]> {
    const apiUrl =
      'https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple';
    return this.http.get<{ results: BackendQuestionInterface[] }>(apiUrl).pipe(
      map((response) => {
        return this.normalizeQuestions(response.results);
      })
    );
  }
  normalizeQuestions(
    backendQuestions: BackendQuestionInterface[]
  ): QuestionInterface[] {
    return backendQuestions.map((backendQuestion) => {
      const incorrectAnswers = backendQuestion.incorrect_answers.map(
        (incorrectAnswer) => decodeURIComponent(incorrectAnswer)
      );
      return {
        question: decodeURIComponent(backendQuestion.question),
        correctAnswer: decodeURIComponent(backendQuestion.correct_answer),
        incorrectAnswers,
      };
    });
  }

  getMockQuestions(): QuestionInterface[] {
    return [
      {
        question: 'What does CSS stand for?',
        incorrectAnswers: [
          'Computer Style Sheets',
          'Creative Style Sheets',
          'Colorful Style Sheets',
        ],
        correctAnswer: 'Cascading Style Sheets',
      },

      {
        question:
          'Where in an HTML document is the correct place to refer to an external style sheet?',
        incorrectAnswers: [
          'In the <body> section',
          'At the end of the document',
          "You can't refer to an external style sheet",
        ],
        correctAnswer: 'In the <head> section',
      },
      {
        question: 'Which HTML tag is used to define an internal style sheet?',
        incorrectAnswers: ['<script>', '<headStyle>', '<css>'],
        correctAnswer: '<style>',
      },
      {
        question: 'Which HTML attribute is used to define inline styles?',
        incorrectAnswers: ['class', 'font', 'styles'],
        correctAnswer: 'style',
      },
      {
        question: 'Which is the correct CSS syntax?',
        incorrectAnswers: [
          '{body:color=black;}',
          '{body;color:black;}',
          'body:color=black;',
        ],
        correctAnswer: 'body {color: black;}',
      },
      {
        question: 'How do you insert a comment in a CSS file?',
        incorrectAnswers: [
          "' this is a comment",
          '// this is a comment',
          '// this is a comment //',
        ],
        correctAnswer: '/* this is a comment */',
      },
      {
        question: 'Which property is used to change the background color?',
        incorrectAnswers: ['color', 'bgcolor', 'bgColor'],
        correctAnswer: 'background-color',
      },
      {
        question: 'How do you add a background color for all <h1> elements?',
        incorrectAnswers: [
          'all.h1 {background-color:#FFFFFF;}',
          'h1.setAll {background-color:#FFFFFF;}',
          'h1.all {background-color:#FFFFFF;}',
        ],
        correctAnswer: 'h1 {background-color:#FFFFFF;}',
      },
    ];
  }
}
