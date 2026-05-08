export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message = 'Not found') {
    super(message);
    this.statusCode = 404;
  }
}
export default NotFoundError;