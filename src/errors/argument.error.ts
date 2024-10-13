import httpStatus from "http-status";

import { CustomError } from "./custom.error";

export class ArgumentValidationError extends CustomError {
  messages: string[];
  errorDetails: any[];

  constructor(message: string, messages: string[], reasonCode?: string) {
    super(message, httpStatus.BAD_REQUEST, reasonCode);
    this.messages = messages;
    this.errorDetails = messages;
  }

  toJSON() {
    return {
      statusCode: this.reasonCode,
      message: this.message,
      errors: this.errorDetails,
    };
  }
}
