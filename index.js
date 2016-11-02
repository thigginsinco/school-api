/* jshint esversion:6 */

var http = require("http");
var fs = require("fs");

var courses = ["algebra", "p.e.", "english", "programming", "science"];

var schedule = [
  { course: "algebra", 
    grade: "A",
    homework: true
  },
  { course: "p.e.",
    grade: "A",
    homework: false
  },
  { course: "english",
    grade: "B",
    homework: true
  }];

function getCourses() {
  return JSON.stringify(courses);
}

function getGrades(obj) {
  var newObj = {};
  for (var i in obj) {
    newObj[obj[i].course] = obj[i].grade;
  }
  return JSON.stringify(newObj);
}

function getSchedule(obj) {
  var newArr = [];
  for (var i in obj) {
    newArr.push(obj[i].course);
  }
  return JSON.stringify(newArr);
}

function getHomework(obj) {
  var newObj = {};
  for (var i in obj) {
    newObj[obj[i].course] = obj[i].homework;
  }
  return JSON.stringify(newObj);
}

var server = http.createServer((req, res) => {

  var splitUrl = req.url.split("/");

  if (req.url === "/index.html" || req.url === "/") {
    fs.readFile("index.html", (err, data) => {
      res.write(data);
      res.end();
    });
  } else if (req.url === "/grades") {
    if (req.method === "GET") {
      res.write(getGrades(schedule));
      res.end();
    }
  } else if (req.url === "/schedule") {
    if (req.method === "GET") {
      res.write(getSchedule(schedule));
      res.end();
    } else if (req.method === "POST") {
      var queryData = "";
      req.on('data', function(data) {
        queryData += data;
        if(queryData.length > 1e6) {
          queryData = "";
          res.writeHead(413, {'Content-Type': 'text/plain'}).end();
          req.connection.destroy();
        }
      });
      req.on('end', function() {
        var obj = {course: queryData, grade: "", homework: false};
        for (var i in schedule) {
          if (schedule[i].course.toLowerCase() === queryData.toLowerCase()) {
          res.write("You are already registered for " + queryData);
          res.end();
          return;
          } 
        } 
        schedule.push(obj);
        res.write("Added " + queryData + " to schedule");
        res.end();
        return;
      });
    }

  } else if (req.url === "/homework") {
    if (req.method === "GET") {
      res.write(getHomework(schedule));
      res.end();

    } else if (req.method === "POST") {
      queryData = "";
      req.on('data', function(data) {
        queryData += data;
        if( queryData.length > 1e6) {
           queryData = "";
          res.writeHead(413, {'Content-Type': 'text/plain'}).end();
          req.connection.destroy();
        }
      });
      req.on('end', function() {
        queryData = queryData.toLowerCase();
        for (var i in schedule) {  
          //console.log(schedule[i].course, "course");
          //console.log(queryData);

          if (schedule[i].course.toLowerCase() === queryData) {
            //console.log(schedule[i].homework, "homework");
            schedule[i].homework = false;
            res.write(JSON.stringify(schedule[i].homework));
            res.end();
            return;
          } 
        }
        res.write("You are not registered for " + queryData + ".");
        res.end();

      });
    }

  }
  else {
    res.write("School is in error");
    res.end();
  }

});

server.listen(8000, () => {
  console.log("Server started on port 8000");
});