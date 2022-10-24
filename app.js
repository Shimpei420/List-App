const express = require('express');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const bcrypt = require("bcrypt");
const paginate = require('express-paginate');
const fs = require("fs");
const npp = 5; //number per page
const languages = ["Ruby", "Javascript", "Java", "Python", "PHP", "Node", "Git&Heroku", "React"];

app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));
app.use(paginate.middleware(10, 50));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shimpei420!',
    database: 'list_app'
});

app.use(
    session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
    })
    )

app.use((req, res, next) => {
    if(req.session.userId === undefined){
        res.locals.name = "Guest"
        res.locals.isLoggedIn = false
    }else{
        res.locals.id = req.session.userId
        res.locals.name = req.session.name
        res.locals.isLoggedIn = true
    }

    next();
})

connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
  });

//Index page

app.get('/', (req, res) => {
    let countbox = {}
    languages.forEach((language)=>{{
        connection.query(
            "SELECT * FROM articles WHERE category = ?",
            [language],
            (errors, result) => {
                count = result.length
                countbox[language] = count
            }
        )
    }})
    connection.query(
        "SELECT * FROM articles",
        (errors, result)=>{
            res.render('index.ejs', {languages, fs, countbox, count})
        }
    )
})    


//To go to each page of languages

languages.forEach((language)=>{
    app.get(`/languages/${language}`, (req, res) => {
        let articles = ""  
        let pageNumber = 0
        let page = 1
        connection.query(
            "SELECT * FROM articles WHERE category = ?",
            [language],
            (error, results) =>{
                pageNumber = Math.ceil(results.length / npp)
            }
        ),
        connection.query(
            "SELECT * FROM articles WHERE category = ? LIMIT ?",
            [language, npp],
            (error, results)=>{
                articles = results
            res.render("languages/" + language + ".ejs", {articles, pageNumber, language, page})
            })
    })
})

languages.forEach((language)=>{
    app.get(`/languages/${language}/:page`, (req, res) =>{
        let articles = ""  
        let pageNumber = 0
        let page = req.params.page
        let count = 0
        connection.query(
            "SELECT * FROM articles WHERE category = ?",
            [language],
            (error, results) =>{
                pageNumber = Math.ceil(results.length / npp)
            }
        )
        if(page === "" || page == 1){
            connection.query(
                "SELECT * FROM articles WHERE category = ? LIMIT ?",
                [language, npp],
                (error, results)=>{
                    articles = results
                    page = 1
                    res.render("languages/" + language + ".ejs", {articles, pageNumber, language, page})
                })
        }else{
            connection.query(
                "SELECT * FROM articles WHERE category = ? LIMIT ? OFFSET ?" ,
                [language, npp, npp * (page - 1)],
                (error, results)=>{
                    articles = results
                    res.render("languages/" + language + ".ejs", {articles, pageNumber, language, page})
                })
        }
    })
})


//New, Post, Edit, Delete

app.get("/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/create", (req, res) => {
    connection.query(
        "INSERT INTO articles(title, summary, content, category, userid, username) VALUES(?, ?, ?, ?, ?, ?)",
        [req.body.title, req.body.summary, req.body.content, req.body.category, req.session.userId, req.session.name],
        (error, results) =>{
            res.redirect("/");
        }
    );
});

app.get("/article/:id", (req, res) =>{
    const id = req.params.id;
    connection.query(
        "SELECT * FROM articles WHERE id = ?",
        [id],
        (error, results) =>{
            res.render("article.ejs", {article: results[0]})
        }
    );
});

app.get("/edit/:id", (req,res) => {
    const id = req.params.id
    connection.query(
        "SELECT * FROM articles WHERE id = ?",
        [id],
        (error, results) =>{
            res.render("edit.ejs", {article: results[0]})
        }
    );
});

app.post("/update/:id", (req, res) =>{
    connection.query(
        "UPDATE articles SET title = ?, summary = ?, content = ?, category = ? WHERE id = ?",
        [req.body.title, req.body.summary, req.body.content, req.body.category, req.params.id],
        (error, results) => {
            res.redirect("/")
        }
    );
});

app.post("/delete/:id", (req, res) => {
    connection.query(
        "DELETE FROM articles WHERE id = ?",
        [req.params.id],
        (error, results) => {
            res.redirect("/")
        }
    );
});

//User session (Sign-up, Log-in, Log-out)
app.get("/signup", (req, res) => {
    res.render("signup.ejs", {errors: []});
})

app.post("/signup", (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];

    if(name === ""){
        errors.push("You need to enter your name");
    }
    if(email === ""){
        errors.push("You need to enter your email address");
    }
    if(password === ""){
        errors.push("You need to enter your password");
    }

    console.log(errors);

    if(errors.length > 0){
        res.render("signup.ejs",{errors: errors});
    }else{
        next();
    }
    },

    (req, res, next) => {
        const email = req.body.email;
        const errors = [];
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            (error, results)=>{
                if(results.length > 0){
                    errors.push("The email address is already registered");
                    res.render("signup.ejs", {errors: errors});
                }else{
                    next();
                }
            }
        );
    },
    (req, res)=>{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        bcrypt.hash(password, 10, (error,hash)=>{
            connection.query(
                "INSERT INTO users (name, email, password) VALUES (?,?,?)",
                [name, email, hash],
                (error, results) => {
                    req.session.userId = results.insertId
                    req.session.name = name
                    res.redirect("/")
                } 
            );
        });
    },  
);

app.get("/login", (req, res) => {
    res.render("login.ejs", {errors: []});
})

app.post("/login", (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];

    if(email === ""){
        errors.push("You need to enter your email address")
    }
    if(password === ""){
        errors.push("You need to enter your password")
    }

    if(errors.length > 0){
        res.render("login.ejs",{errors: errors});
    }else{
        next();
    }
    },
    (req, res) =>{
        const email = req.body.email;
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            (error ,results) => {
                const errors = []
                if(results.length > 0){
                    const plain = req.body.password;
                    const hash = results[0].password;
                    bcrypt.compare(plain, hash, (error, isEqual)=>{
                        if(isEqual){
                            req.session.userId = results[0].id
                            req.session.name = results[0].name
                            res.redirect("/");
                        }else{
                            errors.push("The password is wrong")
                            res.render("login.ejs", {errors: errors})
                        }
                    })
                }else{
                    errors.push("This email is not registered yet")
                    res.render("login.ejs", {errors: errors});
                }
            }
         )
    }
);

app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        console.log("logout done");
        res.redirect("/");
    })
})


//Search

app.get("/search", (req, res) =>{
    let articles = ""  
    let pageNumber = 0
    const keyWord = req.query.search
    let page = req.query.page
    connection.query(
        "SELECT * FROM articles WHERE content LIKE ?",
        ["%" + keyWord + "%"],
        (error, results) =>{
            pageNumber = Math.ceil(results.length / npp)
            
        }
    )
    if(page === undefined || page == 1){
        connection.query(
            "SELECT * FROM articles WHERE content LIKE ? LIMIT ?",
            ["%" + keyWord + "%", npp],
            (error, results)=>{
                articles = results
                page = 1
                res.render("search.ejs", {articles, pageNumber, page, keyWord})
            })
    }else{
        connection.query(
            "SELECT * FROM articles WHERE content LIKE ? LIMIT ? OFFSET ?" ,
            ["%" + keyWord + "%", npp, npp * (page - 1)],
            (error, results)=>{
                articles = results
                res.render("search.ejs", {articles, pageNumber, page, keyWord})
            })
    }
})

//User Page

app.get("/user", (req, res) =>{
    const id = req.query.id
    let page = req.query.page
    let pageNumber = 0
    let articles = ""
    let user = ""
    connection.query(
        "SELECT * FROM articles WHERE userid = ?",
        [id],
        (error, results) =>{
            if(error) throw error;
            pageNumber = Math.ceil(results.length / npp)
        }
    ),
    connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
        (error, result)=>{
             user = result[0]
        }
    );
    if(page === undefined || page == 1){
        connection.query(
            "SELECT * FROM articles WHERE userid = ? LIMIT ?",
            [id, npp],
            (error, results) =>{
                articles = results
                res.render("user.ejs", {user, articles, pageNumber, page})
            }
        )
    }else{
        connection.query(
            "SELECT * FROM articles WHERE userid = ? LIMIT ? OFFSET ?",
            [id, npp, npp * (page-1)],
            (error, results) =>{
                articles = results,
                res.render("user.ejs", {user, articles, pageNumber, page})
            }
        )
    }
});


app.listen(3000);