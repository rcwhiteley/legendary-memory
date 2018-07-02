const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');
const fs = require('fs');
const bodyParser = require('body-parser');
const validation = require('../../database/validation');
router.use(bodyParser.json());

router.use(function timeLog(req, res, next) {
    //console.log("middle");
    log.debug("recibiendo llamada a", req.originalUrl)
    // por si se agrega algun middleware
    next();
});

router.get('/seasons', function(req, res){
   db.getSeasons(function(err, result){
       if(err){
           log.error(req.originalUrl, "fallo al obtener temporadas, error:", err);
           res.sendStatus(500);
       }
       else{
           res.status(200).send(result);
       }
   }) ;
});

router.get('/seasons/:season/tournaments', function(req, res){
   db.getSeasonTournaments(req.params.season, function(err, result){
       if(err){
           log.error(req.originalUrl, "fallo al obtener torneos en temporada", req.params.season, ", error:", err);
       }
       else{
           res.status(200).send(result);
       }
   }) ;
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

router.post('/tournaments', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
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

router.post('/tournaments/:tourny/fixtures', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});


router.get('/tournaments/:tourny/teams', function(req, res){
    log.debug("intentando obtener torneos");
    db.getTeamsInTourny(req.params.tourny, function(err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener equipos, error:", err)
            res.sendStatus(500);
        }
        else {
            log.debug("enviando status 200");
            res.status(200).send(result);
        }
    });
});

router.post('/tournaments/:tourny/teams', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
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

router.post('/fixtures/:game', function(req, res){
    log.debug("post fixture",  req.body.local, req.body.visita, req.body.fecha);
    validation.validarPartido(req.body, (valid) => {
        //console.log(valid);
        if(valid === true){
            db.agregarPartido(1, req.body, (partidoId, error)=>{
                if(partidoId === -1) {
                    res.sendStatus(500);
                }
                else{
                    db.getGame(partidoId, function(err, data){
                        if(err){
                            log.error(req.originalUrl, "fallo al obtener respuesta para insercion de partido");
                            res.sendStatus(500);
                        }
                        else {
                            log.debug("respondiendo con", JSON.stringify(data[0]));
                            res.status(200).send(JSON.stringify(data));
                        }
                    })
                }
            });
        }
        else if(valid === false)
            res.send(JSON.stringify([{"error":"los datos del partido no son validos", "partidos_id":"-1"}]));
        else
            res.send("ocurrio un error inesperado " + validado);
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

router.post('/logo/:team', function(req, res){
    log.debug("post", req.originalUrl);
    res.sendStatus(200);
});

router.post('/fixtures/:game/jugadores', function(req, res) {
    log.debug("editando juagador", JSON.stringify(req.body));
    log.debug("en partido", req.params.game);
    log.debug("jugador matricula", req.body.jugadores_matricula);
    log.debug("con titularidad", req.body.titularidad);
    db.addOrUpdatePlayerInGame(req.params.game, req.body, function (err, result) {
        log.debug(err, result);
        res.sendStatus(200);
    });
});

router.post('/fixtures/:game/goles', function (req, res) {
   log.debug("agregando gol", JSON.stringify(req.body));
   db.addGoal(req.params.game, req.body, function(err, result){
       if(err) {
           log.debug("no se agrego");
           log.debug(err);
           res.sendStatus(500);
       }
       else {
           let golId = result.insertId;
           log.debug("gold id:" ,golId);
           db.getGoal(golId, function(err1, result1){
               if(err1){
                   log.debug(err1);
                   res.sendStatus(500);
               }
               else {
                   console.log(JSON.stringify(result1))
                   res.send(result1);
               }
           });
       }
   });
});

router.post('/fixtures/:game/tarjetas', function (req, res) {
   log.debug("agregando tarjeta", JSON.stringify(req.body));
   db.addCard(req.params.game, req.body, function (err, result) {
      log.debug(err);
      res.sendStatus(200);
   });
});

router.delete('/fixtures/:game/tarjetas', function(req, res){
   log.debug("borrando sancion", req.body.sanciones_id, "en", req.params.game);
   db.removeCard(req.params.game, req.body.sanciones_id, function(err, result){
       if(err){
           res.sendStatus(500);
       }
       else {
           res.sendStatus(200);
       }
   });
});

router.delete('/fixtures/:game/sustituciones', function(req, res){
    log.debug("borrando sustitucion", req.body.sustituciones_id, "en", req.params.game);
    db.removeSubstitution(req.params.game, req.body.sustituciones_id, function(err, result){
        if(err) {
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            res.sendStatus(200);
        }
    });
});

router.delete('/fixtures/:game/goles', function(req, res){
    log.debug("borrando gol", req.body.goles_id, "en", req.params.game);
    db.removeGoal(req.params.game, req.body.goles_id, function(err, result){
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else {
            res.sendStatus(200);
        }
    });
});

router.post('/fixtures/:game/sustituciones', function (req, res) {
    log.debug("agregando sustitucion", JSON.stringify(req.body));
    db.addSubstitution(req.params.game, req.body, function (err, result) {
        log.debug(err);
        res.sendStatus(200);
    });
});

module.exports = router;