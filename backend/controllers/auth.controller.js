import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const signup = async (req, res) => {
    try {
        const { username, fullname, password, email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });

        if (existingEmail || existingUsername) {
            return res.status(400).json({ error: "Email or Username Already Exists" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be atleast 6 characters length" });
        }

        //hashing the password (encrypting)

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                password: newUser.password,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link
            });
        }
        else {
            res.status(400).json({ message: "User Creation Failed" });
        }

    } catch (error) {
        console.error(`Error in SignUp: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordValid = await bcrypt.compare(password, user.password || "");

        if (!user || !isPasswordValid) {
            return res.status(404).json({ error: "Invalid Username or Password" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            password: user.password,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link
        })
    } catch (error) {
        console.error(`Error in Login: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", { maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});     
    } catch (error) {
        console.error(`Error in Logout: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}
export const getme = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.error(`Error in GetMe: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}