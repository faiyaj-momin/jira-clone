/* eslint-disable @typescript-eslint/no-explicit-any */

interface ApiResponseProps<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}

export class ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  constructor({ success, statusCode, message, data }: ApiResponseProps<T>) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
