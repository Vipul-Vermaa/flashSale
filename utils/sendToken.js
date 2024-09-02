export const sendToken = (res, user, message, statusCode = 200) => {

    res.status(statusCode).json({
        success: true,
        message,
        user
    })
}