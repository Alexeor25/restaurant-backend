import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
export interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
}

export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        schemas.params.parse(req.params);
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
