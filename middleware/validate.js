// middleware/validate.js
import { z } from 'zod';

const validate = (schema) => async (req, res, next) => {
  try {
    const parsedBody = await schema.parseAsync(req.body);
    req.body = parsedBody; // Replace req.body with validated data
    next();
  } catch (err) {
    const status = 422;
    const message = 'Fill the input properly';
    const extraDetails = err instanceof z.ZodError ? err.errors[0].message : 'Unknown validation error';

    const error = {
      status,
      message,
      extraDetails,
    };

    console.error(error);
    res.status(status).json(error);
  }
};

export default validate;