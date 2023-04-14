import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const validate_middleware = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    const valid = error === null;

    if (valid) {
      next();
    } else {
      const message = error?.details.map((err) => err.message).join(",");
      res.status(422).json({ error: message });
    }
  };
};
export { validate_middleware }