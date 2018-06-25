const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');
const fs = require('fs');

router.use(function timeLog(req, res, next) {
    //console.log("middle");
    log.debug("recibiendo llamada a", req.originalUrl)
    /* por si se agrega algun middleware*/
    next();
});

router.get('/tournaments/:tourny/standings', function(req, res) {
    db.getStandings(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener posiciones, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/tournaments', function(req, res){
    db.getTournies(function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener torneos, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/tournaments/:tourny/fixtures', function(req, res){
    db.getGames(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener partidos, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/tournaments/:tourny/teams', function(req, res){

    db.getTeams(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener equipos, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/tournaments/:tourny/goalscorers', function(req, res){
    db.getGoalScorers(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener goleadores, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/tournaments/:tourny/teams/:name', function (req, res) {
    db.getTeamPlayersInTourny(req.params.tourny, req.params.name, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener plantel en torneo, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.get('/fixtures/:game', function(req, res){
   db.getGameInfo(req.params.game, function (err, result){
       if(err){
           log.error(req.originalUrl, "fallo al obtener detalles de partido, error:", err)
           res.sendStatus(500);
       }
       else
           res.status(200).send(result);
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
        res.setHeader("Cache-Control"," max-age=3600");

        res.status(200).send({image: contents});
    });
});

module.exports = router;