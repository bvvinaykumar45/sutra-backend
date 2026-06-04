class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    // as message is set by calling super the Error class makes it enumerable fasle which in turn doesn't show up in JSON.stringify conversion as it requires properties to be enumerable
    // To make message property enumerable
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true, // ← this is what makes it show up in JSON
      writable: true,
      configurable: true,
    });

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
