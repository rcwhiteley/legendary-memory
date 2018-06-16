const express = require('express');
const router = express.Router();
const db = require('../../database/mysqldal');
const fs = require('fs');

router.use(function timeLog(req, res, next) {
    /* por si se agrega algun middleware*/
    next();
});

router.get('/:tourny/standings', function(req, res) {
    db.getStandings(req.params.tourny, function(err, result){
        res.send(result);
    });
});

router.get('/tournies', function(req, res){
    db.getTournies(function(err, result){
        if(err){
            console.log("lptm");
        }
        res.send(result);
    });
});

router.get('/:tourny/games', function(req, res){

    db.getGames(req.params.tourny, function(err, result){
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

router.get('/:tourny/teams', function(req, res){

    db.getTeams(req.params.tourny, function(err, result){
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

router.get('/:tourny/goalscorers', function(req, res){
    db.getGoalScorers(req.params.tourny, function(err, result){
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

router.get('/:tourny/teams/:name', function (req, res) {
    db.getTeamPlayersInTourny(req.params.tourny, req.params.name, function(err, result){
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

router.get('/gameinfo/:game', function(req, res){
   db.getGameInfo(req.params.game, function (err, result){
       if(err){
           console.log(err);
       }
       res.send(result);
    });
});

router.get('/logo/:team', function(req, res){
    let logo = './src/public/' + req.params.team + ".png";
    let def = './src/public/nologo.png';

    if(!fs.existsSync(logo))
        logo = def;
    fs.readFile(logo, 'base64', function (err, contents) {
        if (err) {
            console.log(err);
        }
        res.send({image: contents});
    });
});

module.exports = router;