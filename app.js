const express = require('express');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const bcrypt = require("bcrypt");

app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));


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
    connection.query(
        "SELECT * FROM articles",
        (error, results) => {
            res.render('index.ejs', {articles: results});
        }
    );
});

//To go to each page of languages
app.get("/languages/ruby", (req, res) => {
    const language = "Ruby"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/ruby.ejs", {articles: results})
        }
    )   
})

app.get("/languages/javascript", (req, res) => {
    const language = "Javascript"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/javascript.ejs", {articles: results})
        }
    )   
})

app.get("/languages/java", (req, res) => {
    const language = "Java"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/java.ejs", {articles: results})
        }
    )   
})

app.get("/languages/python", (req, res) => {
    const language = "Python"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/python.ejs", {articles: results})
        }
    )   
})

app.get("/languages/php", (req, res) => {
    const language = "PHP"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/php.ejs", {articles: results})
        }
    )   
})

app.get("/languages/node", (req, res) => {
    const language = "Node.js"
    connection.query(
        "SELECT * FROM articles WHERE category = ?",
        [language],
        (error, results) => {
            res.render("languages/node.ejs", {articles: results})
        }
    )   
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
        console.log(errors);
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
                if(results.length > 0){
                    const plain = req.body.password;
                    const hash = results[0].password;
                    bcrypt.compare(plain, hash, (error, isEqual)=>{
                        if(isEqual){
                            req.session.userId = results[0].id
                            req.session.name = results[0].name
                            res.redirect("/");
                        }else{
                            res.redirect("/login");
                        }
                    })
                }else{
                    res.redirect("/login");
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
app.get("/search", (req, res) => {
    keyWord = req.query.search
    connection.query(
        "SELECT * FROM articles WHERE content LIKE ?",
        "%" + [keyWord] + "%",
        (error, results) => {
            res.render("search.ejs", {articles: results});
        }
    )
})

//User Page
app.get("/user/:id", (req, res) =>{
    const id = req.params.id;
    let articles = ""
    connection.query(
        "SELECT * FROM articles WHERE userid = ?",
        [id],
        (error, results) =>{
            if(error) throw error;
            articles = results;
            //console.log(results);
        }
    );
    connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
        (error, result)=>{
            res.render("user.ejs", {articles, user: result[0]})
            //console.log(result)
        }
    )
    }
);


app.listen(3000);