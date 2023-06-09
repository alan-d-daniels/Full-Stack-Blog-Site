
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _=require("lodash"); //underscore because the name is lowdash, lol
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB"); //To connect to the local db and create new db named blogDB

//Schema for the collection post

// const postSchema= new mongoose.Schema({
//   title: String,
//   slug: String,
//   content: String
  
// });

const postSchema= new mongoose.Schema({
  genreName:String,  
  title: String,
  slug: String,
  content: String  
  
});
//Schema for the authentication

const userSchema= new mongoose.Schema({
  email:String,
  password:String
  
});

const aboutSchema= new mongoose.Schema({
  name:String,
  email:String,  
  message:String  
});

//encrypting the password

const secret="Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

//model for the posts
const Post= mongoose.model("Post",postSchema);


//model for the user details
const User = mongoose.model("User",userSchema);

//model for the user details
const About = mongoose.model("About",aboutSchema);



// var posts=[];  //when used without the database!


// Home page GET

// app.get("/",(req,res)=>{

//   Post.find((err,posts)=>{
//     res.render("home",{
//       homeStartingContent: homeStartingContent,
//       posts: posts
//     });    
//   });
  
  
// });

app.get("/",(req,res)=>{ 
  res.render("login")  
});

app.post("/",(req,res)=>{

  if(req.body.submit_param==="submit_value"){
    res.render("home")
  }
  

  if(req.body.username!='' && req.body.password!=''){
    const email=req.body.username;
    const password=req.body.password;

  User.findOne({email:email},(err,foundUser)=>{
    if(err)
      console.log("Error");
    else
      if(foundUser){
        if(foundUser.password===password){
          Post.find((err,posts)=>{
            res.render("home");    
          }); 

        }

        else{
          res.render("error");

        }
      }       

      else{
        res.render("error");
      }
  })
  }
  else{
    res.render("error");
  }
});



app.get("/register",(req,res)=>{
  res.render("register")
  
});

app.post("/register",(req,res)=>{

  if(req.body.username!='' && req.body.password!='' ){
    User.findOne({email:req.body.username},(err,foundUser)=>{
      if(err)
        console.log("Error");
      else
        if(foundUser){
          res.render("existing")          
        }       
  
        else{
          const newUser= new User({
            email:req.body.username,
            password:req.body.password
          });
        
          newUser.save((err)=>{
            if(err)
              console.log("Error");
            else  
            Post.find((err,posts)=>{
              res.redirect("/");    
            }); 
          })
        }
    });
  }
  else{
    res.render("error");    
  }
});

// About page GET

app.get("/about",(req,res)=>{
  res.render("about")
});


//Contact page GET

app.get("/contact",(req,res)=>{  
  res.render("contact");
});

app.post("/contact",(req,res)=>{ 
  console.log(req.body.message);
  const about= new About({
    name:req.body.name,
    email: req.body.email,    
    message: req.body.message
  }); 
  about.save((err)=>{
    if(!err)
    res.render("feedback");
  });
  
});

//Compose page GET

app.get("/compose",(req,res)=>{  
  res.render("compose")
});

// Compose page POST

app.post("/compose",(req,res)=>{     

  

  const post= new Post({
    genreName: _.kebabCase(req.body.genreName),
    title: req.body.postTitle,
    slug: _.kebabCase(req.body.postTitle),
    content: req.body.postBody
  });
  post.save((err)=>{
    if(!err)
    res.redirect("/genre/"+_.kebabCase(req.body.genreName));
  });
});

// Individual Genres

app.get("/genre/:genreName",(req,res)=>{

  

  Post.find((err,posts)=>{
    if(err){
      console.log("Error");
    }
    else{
      
      for(let i=0;i<posts.length;i++){
        var storedGenre=posts[i].genreName;        
        if(_.kebabCase(req.params.genreName)===storedGenre){
          res.render("genre",{
            genreName:_.upperCase(storedGenre),
            posts:posts,
            requestedGenre:_.kebabCase(req.params.genreName)
          });  
          break;        
        }   
      }

    }
    
  });  
});


// Individual Blogpost


app.get("/posts/:postName",(req,res)=>{
  
  Post.findOne({slug:req.params.postName},(err,post)=>{
    res.render("post",{
      title:post.title,
      content:post.content
    })
  });
});

app.listen(3000,()=>{
  console.log("Server Up and Running on port 3000");
});

