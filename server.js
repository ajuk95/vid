require("dotenv").config();
const {genSaltSync, hashSync} = require("bcrypt");
var express = require('express');
var jwt = require('jsonwebtoken');
const app = express();
const format = require('string-format')

let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASS,
    database: 'fixture'
});
// connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');
//     console.log(connection.state)
//   });

app.get('/api', (req, res)=>{
    res.json({ 
        text: 'my api'
    })
})

app.post('/api/login', (req, res)=>{
    res.json('hi')
    const user = { 
        email: 'abc@gmail.com',
        password: '123ABC456' 
    };
    if (!user.email.includes('@', '.')) {
        console.log('error in email');
    } else if (user.password.length < 8) {
        console.log('password needs to be atleast 8 characters long');
    } else {
        const token = jwt.sign({ user }, 'my_secret_key')

        var email = user.email;

        let sql = `SELECT * FROM Users WHERE email = email`;
        // let sql = format('SELECT * FROM Users WHERE email={}', email);
        connection.query(sql, [true], (error, results, fields) => {
        if (error) {
            return console.error('connection error =', error.message);
        }
        console.log(results);
        res.json({
            text: token,
            user: user,
            results: results
        })
        // console.log(fields);
        });

        // connection.end();
        // res.json({
        //     text: token,
        //     user: user
        // })
    } 
})

app.get('/api/protected', ensureToken, (req, res)=>{
    jwt.verify(req.token, 'my_secret_key', function(err, data){
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                text: 'this is protected',
                data: data
            })
        }
    })
})

function ensureToken(req, res, next){
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader!== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);    
    }
}

app.listen(process.env.APP_PORT, function(){
    console.log('App listening on port', process.env.APP_PORT);
});