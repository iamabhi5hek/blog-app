var express= require("express");
var app=express();
var bodyparser=require("body-parser");
var mongoose=require("mongoose");
var methodoverride=require("method-override");
var expresssanitizer=require("express-sanitizer");

//app config
mongoose.connect("mongodb://localhost:27017/app",{ useNewUrlParser: true });
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));
app.use(expresssanitizer());

var blogschema=new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created:{type:Date, default:Date.now}
});

//mongoose model config
var Blog=mongoose.model("Blog",blogschema);


//restful routes

app.get("/",function(req, res) {
   res.redirect("/blogs"); 
});
//index route
app.get("/blogs",function(req,res){
     Blog.find({},function(err,blogs){
         if(err){
           console.log("ERROR!!");  
         }
         else{
             res.render("index",{blogs:blogs});
         }
     });
});
//new route
app.get("/blogs/new",function(req, res) {
   res.render("new"); 
});

//create route
app.post("/blogs",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("/new");
        }
        else{
            res.redirect("blogs");
        }
    });
    
});
//show
app.get("/blogs/:id",function(req, res) {
   Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }
       else{
           res.render("show",{blog:foundBlog});
       }
   });
});

//edit route
app.get("/blogs/:id/edit",function(req, res) {
   Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }
       else{
           res.render("edit",{blog:foundBlog});
       }
   }); 
});

//update
app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});
//delete
app.delete("/blogs/:id",function(req,res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("/blogs");
       } 
       else{
           res.redirect("/blogs");
       }
    });
});


app.listen(process.env.PORT,process.env.IP,function(){
    console.log("BLOGAPP IS CONNECTED");
});