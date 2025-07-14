import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(`Error in getProfile controller: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

export const followunfollow = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findOne({ _id: id });
        const currentuser = await User.findOne({ _id: req.user.id });

        if (id === req.user.id) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        if (!userToModify || !currentuser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentuser.following.includes(id);

        if (isFollowing) {
            // unfollow the user
            await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user.id } });
            await User.findByIdAndUpdate({ _id: req.user.id }, { $pull: { following: id } });
            //notify the user
            res.status(200).json({ message: "Unfollowed successfully" });
        }
        else {
            // follow the user
            await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user.id } });
            await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { following: id } });
            //notify the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();
            res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.error(`Error in followunfollow controller: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userFollowedByMe = await User.findById({ _id: userId }).select("-password");

    const users = await User.aggregate([
        {
            $match: {
                _id: { $ne: userId }, // Exclude the current user
            }
        }, {
            $sample: {
                size: 10 // Get 10 random users
            }
        }
    ]);
    const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach(user => (user.password = null)); // Remove password from suggested users

    res.status(200).json({ suggestedUsers })
    try {

    } catch (error) {
        console.error(`Error in getSuggestedUsers controller: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, fullName, email, currentpassword, newpassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;

        let user = await User.findById({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if ((!newpassword && currentpassword) || (newpassword && !currentpassword)) {
            return res.status(400).json({ error: "Both current and new passwords must be provided" });
        }

        if (currentpassword && newpassword) {
            const isMatch = await bcrypt.compare(currentpassword, user.password);

            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if (newpassword.length < 6) {
                return res.status(400).json({ error: "New password must be at least 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword, salt);
        }

        if (profileImg) {

            // Delete the old profile image from Cloudinary
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }

        // Delete the old cover image from Cloudinaryif (user.coverImg)
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }


            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null; // Remove password from the response
        return res.status(200).json(user);

    } catch (error) {
        console.error(`Error in updateUser controller: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}