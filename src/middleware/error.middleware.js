// 404 Error Handling Middleware
export const notFound = (req, res, next) => {
    res.status(404).send('404 Not Found');
};

// General Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default fallback
    return res.status(500).json({
        success: false,
        error: err.message || "Internal server error"
    });
};