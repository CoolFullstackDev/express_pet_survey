
const mysql = require('mysql');

// backup chart data to json file (cronjob)
module.exports.svg_cron = function cronjob(){

    //mysql db connection
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'census'
    });

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
            console.log(err);
        }

        console.log("breed cronjob");

        var fs = require('fs');

        var obj = {
            name: "breed bubble data",
            children: []
        };

        for (var i = 0; i < rows.length; i++) {
            obj.children.push({ name: rows[i]['breed'], size: rows[i]['size'] });
        }

        var json = JSON.stringify(obj);
        fs.writeFile('public/cronjob/bubble/' + file_name, json, 'utf8', function callback() {
            console.log("breed.json write success: " + file_name);
        });

    });


    //create comment.json for comment word chart
    connection.query("SELECT comment FROM poll", (err, rows, fields) => {
        if (err) {
            console.log(err);
        }

        console.log("comment cronjob");

        var fs = require('fs');

        var obj = {
            data: ""
        };

        var comment_str = "";

        for (var i = 0; i < rows.length; i++) {
            var str = rows[i]['comment'];
            str = str.replace(/\n|\r/g, " ");
            comment_str += " " + str;
        }
        obj.data = comment_str;

        var json = JSON.stringify(obj);

        fs.writeFile('public/cronjob/word/' + file_name, json, 'utf8', function callback() {
            console.log("comment.json write success: " + file_name);
        });

    });


    //create map.json for participater's country
    connection.query("SELECT country, count(country) as size FROM poll group by country", (err, rows, fields) => {
        if (err) {
            console.log(err);
        }

        console.log("country cronjob");

        var fs = require('fs');

        var obj = {
            data: []
        };

        var result_set = rows;

        console.log(result_set);

        fs.readFile('public/data/country.json', 'utf8', function (err, data) {
            if (err) throw err;

            var json_data = JSON.parse(data);
            var country_json_data = json_data['data'];

            for (var i = 0; i < result_set.length; i++) {
                var country_name = result_set[i]['country'];

                for (var j = 0; j < country_json_data.length; j++) {
                    if (country_name == country_json_data[j]['name']) {
                        country_json_data[j]['value'] = result_set[i]['size'];
                        obj.data.push(country_json_data[j]);
                    }
                }

            }

            var json = JSON.stringify(obj);
            fs.writeFile('public/cronjob/map/' + file_name, json, 'utf8', function callback() {
                console.log("country.json write success: " + file_name);
            });


        });

    });
}