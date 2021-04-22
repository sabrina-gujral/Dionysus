const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const querystring = require("querystring");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.render("index");
});

const genresList = [
  "Animation",
  "Children",
  "Comedy",
  "Musical",
  "Horror",
  "Drama",
  "Romance",
  "Action",
  "Crime",
  "Sci-fi",
  "Thriller",
  "Adventure",
  "Fantasy",
  "Mystery",
  "War",
  "Western",
  "Documentary",
];

genresList.sort();

app.post("/", function (req, res) {
  const name = req.body.name;
  const userId = req.body.userid;

  if (userId < 0 || userId > 610) {
    res.render("404");
  } else {
    res.redirect("/rec/" + userId + "/" + name);
  }
});

app.get("/rec/:userId/:name/:filters?", function (req, res) {
  const userId = req.params.userId;
  const name = req.params.name;
  const filters = req.query.filter;

  const url = "https://still-dusk-52410.herokuapp.com/movies/" + userId + "/re";

  https.get(url, function (response) {
    var data;
    response.on("data", function (chunk) {
      if (!data) {
        data = chunk;
      } else {
        data += chunk;
      }
    });

    response.on("end", function () {
      let movieRec = JSON.parse(data);
      const genres = [];
      movieRec.forEach((i) => genres.push(i.genres.split("|")));

      if (typeof filters === "undefined") {
        movieRec = movieRec;
      } else {
        const recs = [];
        filters.forEach(function (filter) {
          movieRec.forEach((rec) =>
            rec.genres.includes(filter) ? recs.push(rec) : null
          );
        });
        movieRec = recs;
      }
      res.render("list", {
        rec: movieRec,
        name: name,
        userId: userId,
        genres: genresList,
      });
    });
  });
});

app.post("/rec/:userId/:name/:filters?", function (req, res) {
  const name = req.params.name;
  const newId = req.body.userid;
  const filters = req.body.filter;

  if (newId < 0 || newId > 610) {
    res.render("404");
  } else {
    res.redirect("/rec/" + newId + "/" + name + "/" + filters);
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("listening on port 3000...");
});
