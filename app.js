const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const url = "mongodb+srv://Keag44:"+process.env.USER_CLUSTER_PWD+"@cluster0.qbvffeu.mongodb.net/blogSiteDB";
mongoose.connect(url);

const contentSchema = mongoose.Schema({
    name:String,
    content:String
});

const Content = mongoose.model("Content",contentSchema);
const Post = mongoose.model("Post",contentSchema);

const homeStartingContent = {name:"Home",content:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
const aboutContent = {name:"About",content:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
const contactContent = {name:"Contact",content:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
const defaulContent = [homeStartingContent,aboutContent,contactContent];

app.get("/",async function(req,res){
try{
    const homeCont = await Content.findOne({name:"Home"});
    if(!homeCont){
        await Content.insertMany(defaulContent);
        res.redirect('/');
    }else{
        const posts = await Post.find();
        res.render("home",{
            homeContent:homeCont.content,
            posts:posts
        });
    }
}catch(error){
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
});

app.get("/about",async(req,res)=>{
try{
    const aboutCont = await Content.findOne({name:"About"});
    if(!aboutCont){
        await Content.insertMany(defaulContent);
        res.redirect('/about');
    }else{
        res.render("about",{aboutContent:aboutCont.content});
    }
}catch(error){
    console.error(error);
    res.status(500).json({message:'Internal Server Error'});
}    
});

app.get("/contact",async(req,res)=>{
try{
    const contactCont = await Content.findOne({name:"Contact"});
    if(!contactCont){
        await Content.insertMany(defaulContent);
        res.redirect('/contact');
    }else{
        res.render("contact",{contactContent:contactCont.content});
    }
}catch(error){
    console.error(error);
    res.status(500).json({message:'Internal Server Error'});
}    
});

app.get("/compose",(req,res)=>{
    res.render("compose");
});

app.post("/compose",async(req,res)=>{
try{
    const newPost = new Post({
        name:req.body.postTitle,
        content:req.body.postEntry
    });
    await newPost.save();
    res.redirect("/");
}catch(error){
    console.error(error);
    res.status(500).json({message:'Internal Server Error'}); 
}
});

app.get("/posts/:postTitle",async(req,res)=>{
try{
    const post = await Post.findOne({name:{ $regex: new RegExp(`^${_.lowerCase(req.params.postTitle)}$`, 'i') } });
    if(!post){
        res.status(400).json({message:'Invalid Post Title'}); 
    }else{
        res.render("post",{post:post});
    }
}catch(error){
    console.error(error);
    res.status(500).json({message:'Internal Server Error'}); 
}
})

const port = process.env.PORT||3000;

app.listen(port,function(){
    console.log("Server is running on port "+port);
})
