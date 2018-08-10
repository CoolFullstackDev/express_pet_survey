const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'census'
})

// const bubble_data = require('public/data/bubble.json')


//show simple first page
router.get('/', (req, res) => {
    res.render('first_no_vote', {
        breeds: [
            "Dog",
            "Cat",
            "Fish",
            "Bird",
            "Rabbit"
        ]
        
    });
})

//get json data and show census result
router.get('/show', (req, res) => {
    res.render('first_census_result', {
        breeds: [
            "Dog",
            "Cat",
            "Fish",
            "Bird",
            "Rabbit"
        ]
    });
})

//get json data and show census result
router.get('/add', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const animal_name = req.body.animal_name;
    const breed = req.body.breed;
    const country = req.body.country;
    const comment = req.body.comment;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('animal_name', "Animal's name is required").notEmpty();
    req.checkBody('breed', 'Breed is required').notEmpty();
    req.checkBody('country', 'Country is required').notEmpty();
    req.checkBody('comment', "Comment is required").notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('/', {
            errors: errors
        });
    } else {
        var cur_date = new Date().toJSON().slice(0,10).replace(/-/g,'/');

        var poll_record = [
            [name, email, animal_name, breed, country, comment, '1.jpg', '1.png', cur_date]
        ];
        con.query("INSERT INTO poll (name, email, animal_name, breed, country, comment, photo_path, thumbnail_path, date) VALUES ?", [poll_record], function (err, result, fields) {
            // if any error while executing above query, throw error
            if (err) throw err;
            // if there is no error, you have the result
            console.log(result);
        });
    }
})

//get all people's poll data for second page
router.get('/get_polls', (req, res) => {
    var cur_date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    console.log(cur_date);

    connection.query("SELECT * FROM poll", (err, rows, fields) => {
        if (err) {
            console.log(err)
            res.end()
        }

        res.json(rows)
    })


})

//cron job for daily backup
router.get('/json_backup', (req, res) => {

    //get current date string
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var cur_date = [year, month, day].join('-');
    var file_name = cur_date + ".json";

    //create bubble.json for breed bubble chart
    connection.query("SELECT breed, count(breed) as size FROM poll GROUP BY breed", (err, rows, fields) => {
        if (err) {
            console.log(err)
            res.end()
        }

        var fs = require('fs');

        var obj = {
            name: "breed bubble data",
            children: []
        };

        for (var i = 0; i < rows.length; i++) {
            obj.children.push({ name: rows[i]['breed'], size: rows[i]['size'] });
        }

        var json = JSON.stringify(obj);
        fs.writeFile('public/cronjob/bubble/' + file_name, json, 'utf8', function callback() { });

        res.end();
    });


    //create comment.json for comment word chart
    connection.query("SELECT comment FROM poll", (err, rows, fields) => {
        if (err) {
            console.log(err)
            res.end()
        }

        var fs = require('fs');

        var obj = {
            data: ""
        };

        var comment_str = "";

        for (var i = 0; i < rows.length; i++) {
            var str = rows[i]['comment'];
            str.replace(/\r?\n|\r/g, ' ');
            comment_str += str;
        }
        obj.data = comment_str;

        var json = JSON.stringify(obj);

        fs.writeFile('public/cronjob/word/' + file_name, json, 'utf8', function callback() { });

        res.end();
    });

})


module.exports = router;