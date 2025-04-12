const User = require('../models/user');
// const crypt = require('bcrypt-nodejs');
const bcrypt = require('bcrypt');
const {generateAccessToken,generateRefreshToken} = require('../service/authservice')

const getAllUser = async (req, res) => {
    try {
        const users = await User.findAll();
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi lấy user " });
    }
};

const registerAccount = async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email da ton tai' });
        }
        salt = await bcrypt.genSalt(10);
        //hash pass
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password : hashedPassword,
        });
        res.status(201).json({ message: 'Dang ky thanh cong', user: newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Dang ky khong thanh cong', error: error });
    }
};

const loginAccount = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const findUser = await User.findOne({ where: { username } });
        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const comparePass = await bcrypt.compare(password, findUser.password);
        if (!comparePass) {
            return res.status(400).json({ message: 'Wrong Password' });
        }

        // Tạo token
        const refreshToken = await generateRefreshToken({ id: findUser.id, username: findUser.username });
        const accessToken = generateAccessToken({ id: findUser.id, username: findUser.username });

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Đăng nhập không thành công', error: error.message });
    }
};

module.exports = { getAllUser, registerAccount ,loginAccount};