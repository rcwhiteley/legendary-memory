app.controller('app-ctrl', function($scope, $http){
    /*  GOLES */

    console.log("pero que mierda la wea");
    $scope.goles = [];
    $http.get("/api/fixtures/<%=partido.partidos_id%>/goles")
        .then(function(response) {
            $scope.goles = response.data;
        });
    $scope.removerGol = function(gol_id){
        showPleaseWait();
        $http.delete("/api/fixtures/<%=partido.partidos_id%>/goles/" + gol_id)
            .then(function (response) {
                let index = -1;
                for(let i = 0; i < $scope.goles.length; i++){
                    if($scope.goles[i].goles_id === gol_id)
                        index = i;
                }
                if(index >= 0){
                    console.log("removiendo");
                    $scope.goles.splice(index, 1);
                }
            }, function(error){
                console.log(error);
                let index = -1;
                for(let i = 0; i < $scope.goles.length; i++){
                    if($scope.goles[i].goles_id === gol_id)
                        index = i;
                }
                if(index >= 0){
                    console.log("removiendo");
                    $scope.goles.splice(index, 1);
                }
            }).then(function ()
        {
            setProgress(100);
            hidePleaseWait();
        });
    }
    $scope.agregarGol = function(){
        showPleaseWait();

        let data =
            {
                jugadores_matricula:$scope.golJugador.jugadores_matricula,
                minuto: $scope.minutoGol
            };
        let url = '/api/fixtures/<%=partido.partidos_id%>/goles';
        $http.post(url, data)
            .then(function(response){
                    console.log(JSON.stringify(response));
                    $scope.goles.push(response.data[0]);
                },
                function(error){
                    console.log(error);
                })
            .then(function() {
                setProgress(100);
                hidePleaseWait();
            });
        console.log("agregando", $scope.minutoGol, $scope.golJugador);
    }
    $scope.jugoEnPartido = function(jugador){
        return jugador.titularidad === 1 || jugador.titularidad === 2;
    }


    /* PLANTEL LOCAL */

    $scope.equipo_local = '<%=partido.local_nombre%>';
    $scope.partido_id = <%=partido.partidos_id%>;
    $scope.plantel_local = [];
    $scope.ruta_plantel_local = '/api/equipos/' + $scope.equipo_local + '/partidos/' + $scope.partido_id + '/jugadores'
    $scope.obtenerJugadoresLocal = function(){
        $http.get($scope.ruta_plantel_local)
            .then(function(response){
                    console.log(response.data);
                    $scope.plantel_local = response.data;
                },
                function(error){
                });
    };
    $scope.removerJugador = function(array, jugador){
        let index = -1;
        for(let i = 0; i < array.length; i++){
            if(array[i].jugadores_matricula === jugador)
                index = i;
        }
        if(index >= 0){
            console.log("removiendo");
            array.splice(index, 1);
        }
    }
    $scope.esTitularLocal = function(jugador) {
        return jugador.titularidad === 1;
    };
    $scope.esSuplenteLocal = function(jugador) {
        return jugador.titularidad === 2;
    };
    $scope.noConvocadoLocal = function(jugador) {
        return jugador.titularidad === 3;
    };
    $scope.cambiarTitularidad = function(original, cambiados, titularidad){
        for(let i = 0; i < cambiados.length; i++){
            for(let j = 0; j < original.length; j++){
                if(cambiados[i].jugadores_matricula === original[j].jugadores_matricula){
                    console.log("cambando");
                    original[j].titularidad = titularidad;
                }
            }
        }
    }
    $scope.mover_titular_a_plantel_local = function(){
        let elegidos = $scope.titulares_elegidos_local.slice();
        $scope.titulares_elegidos_local = [];
        $scope.cambiarTitularidad($scope.plantel_local, elegidos, 3);
    };
    $scope.mover_suplente_a_plantel_local = function(){
        let elegidos = $scope.suplentes_elegidos_local.slice();
        $scope.suplentes_elegidos_local = [];
        $scope.cambiarTitularidad($scope.plantel_local, elegidos, 3);
    };
    $scope.mover_a_titulares_local = function(){
        let elegidos = $scope.plantel_elegidos_local.slice();
        $scope.plantel_elegidos_local = [];
        $scope.cambiarTitularidad($scope.plantel_local, elegidos, 1);
    }
    $scope.mover_a_suplentes_local = function(){
        let elegidos = $scope.plantel_elegidos_local.slice();
        $scope.plantel_elegidos_local = [];
        $scope.cambiarTitularidad($scope.plantel_local, elegidos, 2);
    }
    $scope.obtenerJugadoresLocal();
    $scope.guardar_local = function(){
        showPleaseWait();
        for(let i = 0; i < $scope.plantel_local.length; i++){
            let callBody = {
                "equipos_nombre": $scope.plantel_local[i].equipos_nombre,
                "jugadores_matricula": $scope.plantel_local[i].jugadores_matricula,
                "nombre": $scope.plantel_local[i].nombre,
                "titularidad": $scope.plantel_local[i].titularidad
            }
            $http.post($scope.ruta_plantel_local, callBody)
                .then(function(response){
                        setProgress(100 * i / $scope.plantel_local.length);
                    },
                    function(error){
                        setProgress(100 * i / ($scope.plantel_local.length + 2));
                    })
                .then(function(){
                    setProgress(100);
                    $scope.obtenerJugadoresLocal();
                    hidePleaseWait();
                });
        }
    }


    /* PLANTEL VISITA */

    $scope.equipo_visita = '<%=partido.visita_nombre%>';
    $scope.plantel_visita = [];
    $scope.ruta_plantel_visita = '/api/equipos/' + $scope.equipo_visita + '/partidos/' + $scope.partido_id + '/jugadores'
    $scope.obtenerJugadoresVisita = function(){
        $http.get($scope.ruta_plantel_visita)
            .then(function(response){
                    console.log(response.data);
                    $scope.plantel_visita = response.data;
                },
                function(error){
                });
    };
    $scope.removerJugador = function(array, jugador){
        let index = -1;
        for(let i = 0; i < array.length; i++){
            if(array[i].jugadores_matricula === jugador)
                index = i;
        }
        if(index >= 0){
            console.log("removiendo");
            array.splice(index, 1);
        }
    }
    $scope.esTitularVisita = function(jugador) {
        return jugador.titularidad === 1;
    };
    $scope.esSuplenteVisita = function(jugador) {
        return jugador.titularidad === 2;
    };
    $scope.noConvocadoVisita = function(jugador) {
        return jugador.titularidad === 3;
    };
    $scope.cambiarTitularidad = function(original, cambiados, titularidad){
        for(let i = 0; i < cambiados.length; i++){
            for(let j = 0; j < original.length; j++){
                if(cambiados[i].jugadores_matricula === original[j].jugadores_matricula){
                    console.log("cambando");
                    original[j].titularidad = titularidad;
                }
            }
        }
    }
    $scope.mover_titular_a_plantel_visita = function(){
        let elegidos = $scope.titulares_elegidos_visita.slice();
        $scope.titulares_elegidos_visita = [];
        $scope.cambiarTitularidad($scope.plantel_visita, elegidos, 3);
    };
    $scope.mover_suplente_a_plantel_visita = function(){
        let elegidos = $scope.suplentes_elegidos_visita.slice();
        $scope.suplentes_elegidos_visita = [];
        $scope.cambiarTitularidad($scope.plantel_visita, elegidos, 3);
    };
    $scope.mover_a_titulares_visita = function(){
        let elegidos = $scope.plantel_elegidos_visita.slice();
        $scope.plantel_elegidos_visita = [];
        $scope.cambiarTitularidad($scope.plantel_visita, elegidos, 1);
    }
    $scope.mover_a_suplentes_visita = function(){
        let elegidos = $scope.plantel_elegidos_visita.slice();
        $scope.plantel_elegidos_visita = [];
        $scope.cambiarTitularidad($scope.plantel_visita, elegidos, 2);
    }
    $scope.obtenerJugadoresVisita();
    $scope.guardar_visita = function(){
        showPleaseWait();
        for(let i = 0; i < $scope.plantel_visita.length; i++){
            let callBody = {
                "equipos_nombre": $scope.plantel_visita[i].equipos_nombre,
                "jugadores_matricula": $scope.plantel_visita[i].jugadores_matricula,
                "nombre": $scope.plantel_visita[i].nombre,
                "titularidad": $scope.plantel_visita[i].titularidad
            }
            $http.post($scope.ruta_plantel_visita, callBody)
                .then(function(response){
                        setProgress(100 * i / $scope.plantel_visita.length);
                    },
                    function(error){
                        setProgress(100 * i / ($scope.plantel_visita.length + 2));
                    })
                .then(function(){
                    setProgress(100);
                    $scope.obtenerJugadoresVisita();
                    hidePleaseWait();
                });
        }
    }

    /* TARJETAS */
    $http.get('/api/fixtures/' + $scope.partido_id + '/tarjetas')
        .then(function(response){
            $scope.tarjetas=response.data;
            console.log(response.data);
        }, function(error){

        });
    $scope.removerTarjeta = function(sanciones_id)
    {
        showPleaseWait();
        $http.delete("/api/fixtures/" + $scope.partido_id + "/tarjetas/" + sanciones_id)
            .then(function (response) {
                if (response.data.toLowerCase() === "ok") {
                    let index = -1;
                    for (let i = 0; i < $scope.tarjetas.length; i++) {
                        if ($scope.tarjetas[i].sanciones_id === sanciones_id)
                            index = i;
                    }
                    if (index >= 0) {
                        console.log("removiendo");
                        $scope.tarjetas.splice(index, 1);
                    }
                }
                else{
                    console.log(response.data);
                }
            }, function (error) {

            }).then(function () {
            setProgress(100);
            hidePleaseWait();
        });
    }
    $scope.agregarTarjeta = function () {
        showPleaseWait();
        console.log($scope.jugador_tarjeta);
        let callBody = {
            "jugadores_matricula": $scope.jugador_tarjeta.jugadores_matricula,
            "nombre": $scope.jugador_tarjeta.nombre,
            "minuto": $scope.minuto_tarjeta,
            "tipo": $scope.tipo_tarjeta === "Amarilla" ? 1 : 2,
            "duracion": $scope.duracion_tarjeta
        }
        setProgress(30);
        $http.post('/api/fixtures/' + $scope.partido_id + '/tarjetas', callBody)
            .then(function(response){
                console.log("lesto");
                if(response.data){
                    $scope.tarjetas.push(response.data[0]);
                    console.log("ahhh si ", response.data);
                }
                else{
                    console.log("ahh no");
                }
            },function(error){
                console.log(error);
            })
            .then(function(){
                setProgress(100);
                hidePleaseWait();
            });
    }


    /* SUSTITUCIONES */
    $http.get('/api/fixtures/' + $scope.partido_id + '/sustituciones')
        .then(function(response){
            $scope.sustituciones=response.data;
        }, function(error){

        });
    $scope.removerSustitucion = function(sustitucion_id){
        showPleaseWait();
        console.log("borrar ", sustitucion_id);
        setProgress(30);
        $http.delete('/api/fixtures/' + $scope.partido_id + '/sustituciones/' + sustitucion_id)
            .then(function(response){
                console.log(response.data)
                let index = -1;
                for (let i = 0; i < $scope.sustituciones.length; i++) {
                    if ($scope.sustituciones[i].sustituciones_id === sustitucion_id)
                        index = i;
                }
                if (index >= 0) {
                    console.log("removiendo");
                    $scope.sustituciones.splice(index, 1);
                }
            }, function(error){
                console.log(error);
            })
            .then(function () {
                setProgress(100);
                hidePleaseWait();
            });
    };

    $scope.agregarSustitucion = function(entra, sale, minuto){
        showPleaseWait();
        let callBody = {
            "entra_matricula": entra.jugadores_matricula,
            "sale_matricula": sale.jugadores_matricula,
            "minuto": minuto
        }
        console.log("enviando:");
        console.log(callBody);
        setProgress(30);
        $http.post('/api/fixtures/' + $scope.partido_id + '/sustituciones', callBody)
            .then(function (response) {
                console.log(response.data);
                if(response.data.length > 0){
                    $scope.sustituciones.push(response.data[0]);
                }
            }, function(error){
                console.log(error);
            })
            .then(function () {
                setProgress(100);
                hidePleaseWait();
            });
    }

    /*
    * INICIALIZACION
    */
    $scope.tipo_tarjeta = "Amarilla";
    $scope.gol_jugador = "elija jugador";
});

