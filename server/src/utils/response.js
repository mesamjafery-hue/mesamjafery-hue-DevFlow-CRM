const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendPaginatedSuccess = (res, data, meta, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const sendValidationError = (res, errors, message = 'Validation failed') => {
  res.status(400).json({
    success: false,
    message,
    errors,
    code: 'VALIDATION_ERROR',
  });
};

module.exports = {
  sendSuccess,
  sendPaginatedSuccess,
  sendError,
  sendValidationError,
};
