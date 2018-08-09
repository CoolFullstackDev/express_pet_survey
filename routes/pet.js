const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'census'
})

//show simple first page
router.get('/', (req, res) => {
    res.render('first_no_vote', {
        title: 'First Page'
      });
})

//get json data and show census result
router.get('/show', (req, res) => {
    res.render('first_census_result', {
        title: 'First census Page'
      });
})

//get all people's poll data for second page
router.get('/get_polls', (req, res) => {
    
    connection.query("SELECT * FROM poll", (err, rows, fields) => {
        if(err){
            console.log(err)
            res.end()
        }

        res.json(rows)
    })


})

//cron job for daily backup
router.get('/cronjob', (req, res) => {
    res.send("cron job for d3.js")
})


module.exports = router;