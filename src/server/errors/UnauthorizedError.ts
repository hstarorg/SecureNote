export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message || 'Unauthorized error');
    this.name = 'UnauthorizedError';
  }
}
