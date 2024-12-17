"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsyncError = void 0;
// Return a properly typed middleware function
const catchAsyncError = (theFunc) => {
    return (req, res, next) => {
        return Promise.resolve(theFunc(req, res, next)).catch(next);
    };
};
exports.catchAsyncError = catchAsyncError;
