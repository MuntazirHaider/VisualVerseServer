import jwt from 'jsonwebtoken';
import User from "../models/user.js"

export const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return false;
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decode.id).select('-password')

    return user
}
