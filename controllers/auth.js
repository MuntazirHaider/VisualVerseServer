import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/* REGISTER */
export const register = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body;

        if( !firstName || !lastName || !email || !password ) return res.status(400).json({ message: 'Please provide all mandatory fields' });

        const isExist = await User.findOne({email})
        if(isExist) return res.status(400).json({ message: "User Already Exist With This Credentials" })
    
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({
            firstName,
            middleName,
            lastName,
            email,
            password: hashPassword,
            picturePath,
            friends,
            location,
            occupation,
            totalPosts: 0,
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/* LOGGING IN */
export const login = async(req, res) =>{
    try {
        const {email, password} = req.body;

        if( !email || !password ) return res.status(400).json({ message: 'Please provide an email and a password'});

        const user = await User.findOne({email});
        if (!user) return res.status(400).json(({ message: "User not found" }));
    
        const isPassMatch = await bcrypt.compare(password, user.password);
        if(!isPassMatch) res.status(400).json({ message: "Invalid Credentials" });
    
        const token = jwt.sign( {id: user._id}, process.env.JWT_SECRET );
        delete user.password;
    
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}