export class ConflictError extends Error {
  public statusCode: number;

  constructor(message = 'Conflict') {
    super(message);
    this.statusCode = 409;
  }
}

export default ConflictError;