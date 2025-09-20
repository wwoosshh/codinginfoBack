"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCloudinaryConnection = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const testCloudinaryConnection = async () => {
    try {
        const result = await cloudinary_1.v2.api.ping();
        console.log('✅ Cloudinary connected successfully:', result);
        return true;
    }
    catch (error) {
        console.error('❌ Cloudinary connection failed:', error);
        return false;
    }
};
exports.testCloudinaryConnection = testCloudinaryConnection;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map