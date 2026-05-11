// Объявление класса BadRequestError
export class BadRequestError extends Error {
  // Объявление публичного свойства statusCode типа number
  public statusCode: number;

  // Конструктор класса, принимает опциональное сообщение об ошибке
  constructor(message = 'Bad request') {
    // Вызов конструктора родительского класса Error с переданным сообщением
    super(message);
    // Установка свойства statusCode в значение 400
    this.statusCode = 400;
  }
}

// Экспорт класса
export default BadRequestError;
