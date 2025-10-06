/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Global error handler:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: err.message || 'Internal Server Error',
    });
};
