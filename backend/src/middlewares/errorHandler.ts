import type { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;
  console.error('[request error]', error.message);

  const errorStatus =
    'status' in error && typeof error.status === 'number' ? error.status : 500;
  const status = errorStatus >= 400 && errorStatus < 600 ? errorStatus : 500;

  return res.status(status).json({
    message:
      status === 400
        ? 'The request body is invalid.'
        : 'The service is temporarily unavailable. Please try again later.',
  });
};
