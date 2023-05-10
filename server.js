`use strict`;
const express = require('express');
const server = express();
const cors = require('cors')
server.use(cors());
require('dotenv').config();
const axios = require('axios');
const PORT = process.env.PORT || 3001;
const data = require(`./movieData/data.json`);
const pg = require('pg');
const apiKey = process.env.APIKey; //  To Run the code with my APIKey copy it from(./env.sample)
server.use(express.json());
//lab 15 --------------------------------------------------------------
const client = new pg.Client(process.env.PGURL)

//lab 13 ----------------------------------------------------------------
server.get(`/`, homeHandler);
server.get(`/favorite`, favoritePageHandler);
//lab 14-----------------------------------------------------------------
server.get(`/trending`, trendingPageHandler);
server.get('/search', searchPageHandler);
server.get('/topRated', topRatedPageHandler);
server.get('/nowplaying', nowPlayingPageHandler);
//lab 15 ----------------------------------------------------------------
server.get('/getMovies', getMoviesHandler);
server.post('/addMovies', addMovieHandler);
// lab 16 ----------------------------------------------------------------
server.delete('/deleteMovie/:id', deleteMovieHandler);
server.put('/upDateMovie/:id', updateMovieHandler);
server.get('/getMoviesById', geteMoviesByIdHandler);
//------------------------------------------------------------------------
server.get(`*`, defaultHandler);
server.use(errorHandler);





function homeHandler(req, res) {
    const movie = new Movie(data.title, data.poster_path, data.overview)
    res.status(200).send(movie);
};

function favoritePageHandler(req, res) {
    res.status(200).send('Welcome to Favorite Page')
};

function defaultHandler(req, res) {
    res.status(404).send('page not found')
};


function trendingPageHandler(req, res) {
    let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let theMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return theMovie;
                })
                res.send(mapResult);
            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

function searchPageHandler(req, res) {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${"The Super Mario Bros. Movie"}`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let theMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return theMovie;
                })
                res.send(mapResult);
            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

function topRatedPageHandler(req, res) {

    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new TopRatedMovie(item.id, item.title, item.popularity, item.vote_average, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

function nowPlayingPageHandler(req, res) {
    let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let theMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return theMovie;
                })
                res.send(mapResult);
            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res)
    }
}
// lab 15-----------------------------------------------------------------------------------
function getMoviesHandler(req, res) {

    const sql = `SELECT * FROM addMovie`;
    client.query(sql)
        .then(data => {
            res.send(data.rows);
        })

        .catch((error) => {
            errorHandler(error, req, res)
        })
}
function addMovieHandler(req, res) {
    const newMovie = req.body;
    console.log(newMovie);
    const sql = `INSERT INTO addMovie (title, overView, mins, releaseDate, posterPath)
    VALUES ($1, $2, $3, $4, $5);`
    const values = [newMovie.title, newMovie.overView, newMovie.mins, newMovie.releaseDate, newMovie.posterPath];
    client.query(sql, values)
        .then(data => {
            res.send("The data has been added successfully");
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}
// lab 16-----------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------
function deleteMovieHandler(req, res) {

    const id = req.params.id;
    const sql = `DELETE FROM addMovie WHERE id= ${id};`
    client.query(sql)
        .then((data) => {
            res.status(202).send(data);
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
};
function updateMovieHandler(req,res){

    const {id} = req.params;
    const sql = `UPDATE addMovie
    SET title = $1, overview =$2, mins= $3, releasedate = $4, posterpath = $5
    WHERE id = ${id};`
    const {title, overview, mins, releasedate, posterpath} = req.body;
    const values = [title, overview, mins, releasedate, posterpath];
    client.query(sql,values).then((data)=>{
        res.send(data)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
};
function geteMoviesByIdHandler(req,res){
    
    let id = req.query.id;
    const sql = `SELECT * FROM addMovie WHERE id = ${id};`
    client.query(sql)
        .then((data) => {
            res.send(data.rows)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}

//Constructor functions--------------------------------------------------------------------- 

function Movie(title, poster_path, overview) {
    this.title = title
    this.poster_path = poster_path
    this.overview = overview
}

function Item(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function TopRatedMovie(id, title, popularity, vote_average, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.popularity = popularity;
    this.vote_average = vote_average;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`listening on ${PORT}`)
        })

    })
