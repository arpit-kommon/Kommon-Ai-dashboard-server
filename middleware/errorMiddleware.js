// middleware/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const extraDetails = err.extraDetails || 'An unexpected error occurred';
  
    console.error(`[Error] ${status}: ${message} - ${extraDetails}`);
    res.status(status).json({ message, extraDetails });
};
  
export default errorMiddleware;