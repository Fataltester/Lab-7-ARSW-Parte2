var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var drawingId = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    var drawPolygon = function(points) {
        if (points.length < 3) return;
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath(); // conecta el último punto con el primero
        ctx.stroke();
    };

    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info("Connecting to WS for drawing ID: " + drawingId);
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        // Conectarse al servidor STOMP
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            var topic = `/topic/newpoint.${drawingId}`;
            console.log("Subscribed to topic: " + topic);

            // Suscribirse al tópico /topic/newpoint
            stompClient.subscribe(topic, function (message) {
                console.log("Mensaje recibido desde el servidor:", message.body);
                // Extraer el contenido del mensaje
                var theObject = JSON.parse(message.body);

                // Mostrar el canvas actualizado
                addPointToCanvas(theObject);
            });
            // Suscribirse al topico /topic/newpolygon
            var topicPoligonos = `/topic/newpolygon.${drawingId}`;
            stompClient.subscribe(topicPoligonos, function(message) {
                var polygonPoints = JSON.parse(message.body); // array de puntos
                drawPolygon(polygonPoints);
            });
        });
    };

    // Publicar punto en el tópico correspondiente
    var publishPoint = function (x, y) {
        if (!stompClient) {
            alert("Debe conectarse a un dibujo antes de enviar puntos.");
            return;
        }

        var pt = new Point(x, y);
        addPointToCanvas(pt);
        var topic = `/app/newpoint.${drawingId}`;
        stompClient.send(topic, {}, JSON.stringify(pt));
        console.info(`Punto enviado a ${topic}: `, pt);
    };

    return {
        connect: function () {
            drawingId = document.getElementById("drawingId").value.trim();
            if (!drawingId) {
                alert("Por favor, ingrese un ID de dibujo.");
                return;
            }
            connectAndSubscribe(drawingId);
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (evt) {
                var pos = getMousePosition(evt);
                publishPoint(pos.x, pos.y);
            });
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
                console.log("Disconnected");
            }
        }
    };
})();