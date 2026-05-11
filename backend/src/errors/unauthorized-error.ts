// Объявляем класс UnauthorizedError, который наследует стандартный класс Error
export class UnauthorizedError extends Error {
  // Публичное свойство для хранения HTTP-статуса ошибки (тип number)
  public statusCode: number;

  // Конструктор класса, принимает сообщение об ошибке (по умолчанию 'Unauthorized')
  constructor(message = "Unauthorized") {
    // Вызываем конструктор родительского класса Error с сообщением
    super(message);
    // Устанавливаем статус-код HTTP в 401
    this.statusCode = 401;
  }
}

//Экспорт класса
export default UnauthorizedError;
