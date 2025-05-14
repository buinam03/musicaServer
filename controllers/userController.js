const User = require('../models/user');
// const crypt = require('bcrypt-nodejs');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../service/authservice');
const { literal, where } = require('sequelize');

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

const getUserById = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findOne({
            where: { id: id },
        })

        res.status(200).json({ message: "Success!", data: user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy user ", error: error });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        // `req.user` sẽ có thông tin từ token nhờ middleware `authenticateJWT`
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (user.profile_picture && user.profile_picture.startsWith('@/image')) {
            user.profile_picture = '/images' + user.profile_picture.replace('@/image', '');
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Success!', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};
const getRandomUser = async (req, res) => {
    try {
        const result = await User.findAll({
            order: literal('RAND()'),
            limit: 12,
        })
        res.status(200).json({ message: 'Success', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
}

const registerAccount = async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email da ton tai' });
        }
        let salt = await bcrypt.genSalt(10);
        //hash pass
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: 'Dang ky thanh cong', user: newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Dang ky khong thanh cong', error: error });
    }
};

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        const findUser = await User.findOne({ where: { email } });
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

const updateProfilePicture = async (req, res) => {
    const id = req.user.id;
    const { profilePicture } = req.body;
    try {
        await User.update(
            {
                profile_picture: profilePicture,
            },
            {
                where: { id: id }
            })
        const result = await User.findOne({
            where: { id: id }
        })
        res.status(200).json({ message: 'Success', data: result });
    } catch (error) {
        return res.status(500).json({ message: 'Change fail', error: error.message });
    }
}

const updateHeaderPicture = async (req, res) => {
    const id = req.user.id;
    const { headerpicture } = req.body;
    try {
        await User.update(
            {
                header_picture: headerpicture,
            },
            {
                where: { id: id }
            })
        const result = await User.findOne({
            where: { id: id }
        })
        res.status(200).json({ message: 'Success', data: result });
    } catch (error) {
        return res.status(500).json({ message: 'Change fail', error: error.message });
    }
}

const getProvince = async (req, res) => {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: 'get fail', error: error.message });
    }
}

const updateUserInfo = async (req, res) => {
    const id = req.user.id;
    const { username, province, country, bio } = req.body;
    try {
        await User.update({
            username: username,
            province: province,
            country: country,
            bio: bio,
            },
            {
                where: { id: id }
            })
        const result = await User.findOne({
            where: { id: id }
        })
        res.status(200).json({ message: 'update success', data: result });
    } catch (error) {
        return res.status(500).json({ message: 'update user fail', error: error.message });
    }
}
module.exports = { updateUserInfo, getProvince, updateHeaderPicture, updateProfilePicture, getAllUser, registerAccount, loginAccount, getUserById, getCurrentUser, getRandomUser };