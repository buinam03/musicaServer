const jwt = require('jsonwebtoken');
require('dotenv').config();
const RefreshTokens = require('../models/refreshtokens');
const User = require('../models/user');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token' });
    }
}

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
}

const saveRefreshTokens = async (users_id, refreshtokens) => {
    try {
        await RefreshTokens.create({
            user_id: users_id,
            refreshToken: refreshtokens,
        })
        console.log(users_id,refreshtokens);
    } catch (error) {
        console.error('Error saving refresh token:', error);
    }


}

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    await saveRefreshTokens(user.id,refreshToken);

    return refreshToken;    
}

const refreshAccessToken = async (req, res) => {
    const { refreshTokens } = req.body;
    if (!refreshTokens) {
        return res.status(403).json({ message: 'Refresh Token is required' });
    }
  
    try {
        const TokenFromDb = await RefreshTokens.findOne({where : {refreshToken : refreshTokens}});

        if(!TokenFromDb){
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }
        const user = jwt.verify(refreshTokens, process.env.JWT_REFRESH_SECRET);

        const username = User.findOne({where : {id : user.id}});
        console.log(username);
        const newAccessToken = jwt.sign(
            { id: user.id, username: username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        )
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Refresh Token has expired' });
    }

}

module.exports = { authMiddleware, generateAccessToken, generateRefreshToken, refreshAccessToken }