export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message || 'Bad request error');
    this.name = 'BadRequestError';
  }
}
