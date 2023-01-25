const User=require("../models/Users")
// var { expressjwt: jwt } = require("express-jwt");
const jwt  = require('jsonwebtoken');
const bcrypt=require("bcrypt");

exports.register=async(req,res)=>{
    try{
const{name,email,password}=req.body;
let user=await User.findOne({email});
if(user) return res.status(400).json({success:false,message:"User Already Exists"});
user=await User.create({name,email,password,
avatar:{public_id:"smaple_id",url:"sample_url   "}
}); 
  // Create token
  
  const registertoken = jwt.sign(
    { user_id: user._id, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

res.status(201).json({success:true,user,token:registertoken});
    }
    catch(e){
      console.log("e")
res.status(500).json({
    success:false,
    message:e.message
})
    }
}
exports.login=async(req,res)=>{
    try{
//         const{email,password}=req.body;
//         const user=User.findOne({email}).select('+password');
//         if(!user){
//             return res.status(400).json({success:false,message:"User Not Found"});
//         }
//         var users=new User();//Error a raha tha so have to create new user object to use schema methods
//         const isMatch= users.matchPassword(password);

//         if(!isMatch){
//             console.log("User Not Match");
//             return res.status(400).json({success:false,message:"Password Incorrect"});
            
//         }
       
//         // const token=await users.generatetoken(_id); 
//          // Create token
//   const token = jwt.sign(
//     { user_id: user._id, email },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "2h",
//     }
//   );
//         res.status(200).cookie("token",token).json({
//             success:true,
//             user
//         })  
const { email, password } = req.body;

// Validate user input
if (!(email && password)) {
  res.status(400).send("All input is required");
}
// Validate if user exist in our database
const user = await User.findOne({ email }).select("+password");
// console.log(password);
// console.log(user.password);
if (user && (await bcrypt.compare(password, user.password))) {
  // Create token

  const token = jwt.sign(
    { user_id: user._id, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  // save user token
  // user.token = token;

  // // user
  // res.status(200).json(user);
  res.status(200).cookie("token",token).json({
                 success:true,
                 user
           })  
}
else if(!await bcrypt.compare(password, user.password)){
  return res.status(400).json({success:false,message:"Password Incorrect"});
}
// res.status(400).send("Invalid Credentials");
    } 
    catch(e){
      
     return   res.status(500).json({success:false,message:e.message})
    }

}
exports.followUser=async(req,res)=>{
  try{
const usertofollow=await User.findById(req.params.id);
const logggedinuser=await User.findById(req.user._id);
if(!usertofollow){
  return res.status(404).json({
    success:false,
    message:"User Not Found"
  })
}

if(logggedinuser.following.includes(usertofollow._id)){
  const indexfollowing=logggedinuser.following.indexOf(usertofollow._id);
  logggedinuser.following.splice(indexfollowing,1);
  const indexfollowers=usertofollow.followers.indexOf(usertofollow._id);
  usertofollow.followers.splice(indexfollowers,1);
  logggedinuser.save();
  usertofollow.save();
  return res.status(200).json({
    success:true,
    message:"User UnFollowed"
  })
}
else{
logggedinuser.following.push(usertofollow._id);
usertofollow.followers.push(logggedinuser._id);
console.log("loggedinuser",logggedinuser);
console.log("usertofollow",usertofollow)
logggedinuser.save();
usertofollow.save();
res.status(200).json({
  success:true,
  message:"User Followed"
})
}

  }
  catch(e){
    return   res.status(500).json({success:false,message:e.message})
  }
}
exports.logout=async(req,res)=>{
try{
res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly:true }).json({
  success:true,
  message:"Logged Out",
})
}
catch(e){
return res.status(500).json({
  success:false,
  message:e.message
})
}
}