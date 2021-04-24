const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
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

app.get("/rec/:userId/:name/:filters?/:title?", function (req, res) {
  const userId = req.params.userId;
  const name = req.params.name;
  const filters = req.query.filter;
  const title = req.query.title;

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
        const movs = [];
        filters.forEach(function (filter) {
          movieRec.forEach((rec) =>
            rec.genres.includes(filter) ? movs.push(rec) : null
          );
        });
        movieRec = movs;
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

app.post("/rec/:userId/:name/:filters?/:title?", function (req, res) {
  const name = req.params.name;
  const newId = req.body.userid;
  const filters = req.body.filter;

  if (newId < 0 || newId > 610) {
    res.render("404");
  } else {
    res.redirect("/rec/" + newId + "/" + name + "/" + filters);
  }
});

app.get("/:title", function (req, res) {
  const spawn = require("child_process").spawn;

  const title = req.params.title;
  const pythonProcess = spawn("python", ["./recommender/recommend.py", title]);

  var dataStr = "";

  pythonProcess.stdout.on("data", (data) => {
    dataStr += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  pythonProcess.on("exit", (code) => {
    console.log("Process quit with code : " + code);

    const recommendations = JSON.parse(dataStr);

    const titles = Object.values(recommendations.title);
    const urls = Object.values(recommendations.movie_url);
    const posters = Object.values(recommendations.poster);
    const genres = Object.values(recommendations.genres);
    const director = Object.values(recommendations.director);

    res.render("content", {
      title: titles,
      urls: urls,
      posters: posters,
      genres: genres,
      director: director,
    });
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("listening on port 3000...");
});
