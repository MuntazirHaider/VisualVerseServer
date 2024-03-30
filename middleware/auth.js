import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(403).send("Access Denied: No token provided");
        }

        if (!token.includes("Bearer ")) {
            return res.status(401).send("Invalid Token Format");
        }

        const extractedToken = token.replace(/Bearer\s/, '');

        const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token Expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send("Invalid Token");
        }
        res.status(500).json({ error: error.message });
    }
}
