// Объявление класса NotFoundError, который наследует стандартный класс Error
export class NotFoundError extends Error {
  // Публичное числовое свойство для хранения HTTP-статуса ошибки
  public statusCode: number;

  // Конструктор класса, принимает сообщение об ошибке (по умолчанию 'Not found')
  constructor(message = "Not found") {
    // Вызов конструктора суперкласса Error с переданным сообщением
    super(message);
    // Установка кода состояния HTTP в 404
    this.statusCode = 404;
  }
}

// Экспорт класса
export default NotFoundError;
