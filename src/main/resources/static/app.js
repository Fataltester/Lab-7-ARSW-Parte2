var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Conectarse al servidor STOMP
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);

            // Suscribirse al tópico /topic/newpoint
            stompClient.subscribe('/topic/newpoint', function (message) {
                // Extraer el contenido del mensaje
                var theObject = JSON.parse(message.body);

                // Mostrar en una alerta las coordenadas recibidas
                alert("Nuevo punto recibido: X=" + theObject.x + " Y=" + theObject.y);

                if (polygonObj.points && polygonObj.points.length > 0) {
                    addPointToCanvas(receivedPoint);
                }
            });
        });
    };

    return {
        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("Publishing point at: " + JSON.stringify(pt));

            // Dibujar localmente
            addPointToCanvas(pt);

            // Enviar el punto al broker
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();