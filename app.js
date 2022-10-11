
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _=require("lodash"); //underscore because the name is lowdash, lol
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

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

//encrypting the password

const secret="Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

//model for the posts
const Post= mongoose.model("Post",postSchema);


//model for the user details
const User = mongoose.model("User",userSchema);



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
  if(req.body.contact==="details"){
    res.render("feedback")
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

  else{
    res.render("error");
    
  } 

});

// About page GET

app.get("/about",(req,res)=>{
  res.render("about",{
    aboutContent: aboutContent
  })
});


//Contact page GET

app.get("/contact",(req,res)=>{  
  res.render("contact",{
    contactContent: contactContent
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

