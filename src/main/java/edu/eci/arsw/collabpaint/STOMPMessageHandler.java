package edu.eci.arsw.collabpaint;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import edu.eci.arsw.collabpaint.model.Point;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessageHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private Map<String, List<Point>> puntosPorDibujo = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point point,@DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido: " + point + numdibujo);
        List<Point> puntos = puntosPorDibujo.computeIfAbsent(numdibujo, k -> Collections.synchronizedList(new ArrayList<>()));
        puntos.add(point);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, point);
        if (puntos.size() >= 4) { // o 3 si quieres triángulos
            List<Point> poligono = new ArrayList<>(puntos);
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, poligono);
            puntos.clear(); // reinicia la lista para el siguiente polígono
        }
        System.out.println("Enviando JSON: " + new ObjectMapper().writeValueAsString(point));
    }
}