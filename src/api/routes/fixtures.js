const express = require('express');
const router = express.Router();
const log = require('../../config/logger');
const db = require('../../database/mysqldal');
const validation = require('../../database/validation');

router.get('/:game', function(req, res){
    db.getGameInfo(req.params.game, function (err, result){
        if(err){
            log.error(req.originalUrl, "fallo al obtener detalles de partido, error:", err)
            res.sendStatus(500);
        }
        else
            res.status(200).send(result);
    });
});

router.post('/:game', function(req, res){
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

router.get('/:game/tarjetas', function (req, res) {
    db.getGameSantions(req.params.game, function(err, result){
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            res.send(result);
        }
    });
});

router.post('/:game/tarjetas', function (req, res) {
    log.debug("agregando tarjeta", JSON.stringify(req.body));
    db.addCard(req.params.game, req.body, function (err, result) {
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            db.getCard(result.insertId, function (err1, result1) {
                if(err1){
                    log.debug(err1);
                    res.sendStatus(500);
                }
                else{
                    res.send(result1);
                }
            })
        }
    });
});

router.delete('/:game/tarjetas/:sancion_id', function(req, res){
    log.debug("borrando sancion", req.params.sancion_id, "en", req.params.game);
    db.removeCard(req.params.game, req.params.sancion_id, function(err, result){
        if(err){
            res.sendStatus(500);
        }
        else {
            res.sendStatus(200);
        }
    });
});

router.get('/:game/sustituciones', function(req, res){
    db.getGameSubs(req.params.game, function (err, result) {
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            res.send(result);
        }
    }) ;
});

router.post('/:game/sustituciones', function (req, res) {
    log.debug("agregando tarjeta", JSON.stringify(req.body));
    db.addSubstitution(req.params.game, req.body, function (err, result) {
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            db.getSubstitution(req.params.game, result.insertId, function (err1, result1) {
                if(err1){
                    log.debug(err1);
                    res.sendStatus(500);
                }
                else{
                    res.send(result1);
                }
            })
        }
    });
});

router.delete('/:game/sustituciones/:sustitucion_id', function(req, res){
    log.debug("borrando sustitucion", req.params.sustitucion_id, "en", req.params.game);
    db.removeSubstitution(req.params.game, req.params.sustitucion_id, function(err, result){
        if(err) {
            log.debug(err);
            res.sendStatus(500);
        }
        else{
            res.sendStatus(200);
        }
    });
});

router.get('/:game/goles', function(req, res){
    log.debug("obteniendo goles en", req.params.game);
    db.getGameGoals(req.params.game, function(err, result) {
        if (err) {
            log.debug(err);
            res.sendStatus(500);
        }
        else {
            res.send(result);
        }
    });
});

router.post('/:game/goles', function (req, res) {
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
                    console.log(JSON.stringify(result1));
                    res.send(result1);
                }
            });
        }
    });
});

router.delete('/:game/goles/:gol', function(req, res){
    log.debug("borrando gol", req.params.gol, "en", req.params.game);
    db.removeGoal(req.params.game, req.params.gol, function(err, result){
        if(err){
            log.debug(err);
            res.sendStatus(500);
        }
        else {
            console.log(result);
            res.sendStatus(200);
        }
    });
});



module.exports = router;