/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rijoe Chacko Mathew Student ID: 132469214 Date: 25-MAR-22
*
*  Online (Heroku) Link: https://sheltered-springs-25629.herokuapp.com
*
********************************************************************************/

var collegeData = require("./modules/collegeData.js"); //Importing the collegeData Module
var path = require("path"); //Importing the path Module
var exphbs = require("express-handlebars"); //Importing the express handlebars module

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        mailLink: function(options){
            return '<td><a href="mailto:' + options.fn(this) + '">' + options.fn(this) + '</a></td>';
        },
        courseLink: function(courseID,options){
            return '<td><a href="/students?course=' + courseID + '">' + options.fn(this) + '</a></td>';
        },
        studentLink: function(studentNum,options){
            return '<td><a href="/student/' + studentNum + '">' + options.fn(this) + '</a></td>';
        },
        courseIdLink: function(courseID,options){
            return '<td><a href="/course/' + courseID + '">' + options.fn(this) + '</a></td>';
        }
    }
}));

app.set('view engine', '.hbs');


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});


// setup a 'route' to listen on the url path /students and additionaly to /students?course=value
app.get("/students", (req, res) => {
    
    if (Object.keys(req.query).length == 0){    //checks if the req.query object is empty 
    collegeData.getAllStudents().then(data => {res.render("students", {students: data});})  //use the getAllStudents to get all student objects and sends the json formatted string if successfull
        .catch(() => {res.render("students", {message: "no results"});})  //when the method invokes reject, send the mentioned object back as json
    }

    //use the getStudentsByCourse to get all student objects with course parameter having value as req.query.course and sends the json formatted string if successfull
    else{  
    collegeData.getStudentsByCourse(req.query.course).then(data => {res.render("students", {students: data});})
        .catch(() => {res.render("students", {message: "no results"});})    //when the method invokes reject, send the mentioned object back as json
    }  
    });


// setup a 'route' to listen on the url path /courses and sends the json formatted string of all courses
app.get("/courses", (req, res) => {        
    collegeData.getCourses().then(data => {res.render("courses", {courses: data});})
        .catch(() => {res.render("courses", {message: "no results"});})
    });


// setup a 'route' to listen on the url path /student/:num and sends the json object of the student whose studentNum parameter holds the value same as num
app.get("/student/:num", (req, res) => {     
    collegeData.getStudentByNum(req.params.num).then(data => {res.render("student", { student: data });})
        .catch(() => {res.send(JSON.stringify({message:"no results"}) )})
    });

 
// setup a 'route' to listen on the default url path 
app.get("/", (req, res) => {     
    res.render('home');
    });


// setup a 'route' to listen on the url path /about
app.get("/about", (req, res) => {     
    res.render('about');
    });


// setup a 'route' to listen on the url path /htmlDemo
app.get("/htmlDemo", (req, res) => {     
    res.render('htmlDemo');
    });


app.get("/students/add", (req, res) => {     
    res.render('addStudent');
    });


app.get("/public/css/theme.css", (req, res) => {     
    res.sendFile(path.join(__dirname +'/public/css/theme.css'))
    });


//added body parser
app.use(express.urlencoded({ extended: true }));

app.post('/students/add', function (req, res) {
    collegeData.addStudent(req.body).then(()=>{res.redirect('/students')})
    .catch(() => {res.send(JSON.stringify({message:"no results"}) )})
    })

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body).then(()=>{res.redirect('/students')})
    });
    

app.get("/course/:id", (req, res) => {     
    collegeData.getCourseById(req.params.id).then(data => {res.render("course", { course: data });})
    .catch(() => {res.send(JSON.stringify({message:"no results"}))})
    });
    
        

// used to add middleware to return page not found message when the user enters a route that is not matched with anything in the app 
app.use((req, res) => {
    res.status(404).send("Page Not Found");
    });

// used to identify "public" folder as a source for static files
app.use(express.static(path.join(__dirname +'/public')));



// checks if initialize method is successfull then setup http server to listen on HTTP_PORT, if initalize method invoked reject error is displayed on console
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)});
})
    .catch(error => {console.log(error)});