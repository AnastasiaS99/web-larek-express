// Объявление класса ConflictError, наследующего от стандартного класса Error
export class ConflictError extends Error {
  // Свойство statusCode: хранит HTTP-статус для ошибки (409)
  public statusCode: number;

  // Конструктор класса: принимает сообщение об ошибке (по умолчанию 'Conflict')
  constructor(message = "Conflict") {
    // Передаём сообщение в конструктор родительского класса Error
    super(message);
    // Устанавливаем HTTP-статус 409 (Conflict)
    this.statusCode = 409;
  }
}

// Экспорт класса
export default ConflictError;
