import httpStatus from "http-status";
import {User} from "../models/user.models.js";
import {Meeting} from "../models/meeting.models.js";
import bcrypt , {hash} from "bcrypt"; 
import crypto from "crypto"; 

const login = async (req,res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({message:"Please Provide all details"});
    }
    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User not Found!"});
        }
        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(isPasswordCorrect){
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({token: token});
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Credentials!!"});
        }
    }catch(e){
        return res.status(500).json({message: `Something Went Wrong ${e}`});
    }
}

const register = async (req,res) => {
    const {name, username , password} = req.body;

    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message: "User Already Exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User(
            {
                name: name,
                username: username,
                password: hashedPassword
            }
        );

        await newUser.save();
        res.status(httpStatus.CREATED).json({message: "User Registered"});
    }catch(e){
        json({message: `Something Went Wrong ${e}`});
    }
}

const getUserHistory = async(req,res)=>{
    const {token} = req.query;

    try{
        const user = await User.findOne({token: token});
        const meeting = await Meeting.find({user_id: user.username});
        res.json(meeting);
    }catch(e){
        console.log(e);
    }
}


export {login, register , getUserHistory};