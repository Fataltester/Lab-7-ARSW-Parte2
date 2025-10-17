package edu.eci.arsw.collabpaint;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class STOMPMessageHandler {

    @MessageMapping("/newpoint")
    @SendTo("/topic/newpoint")
    public Point handlePointEvent(Point point) throws Exception {
        System.out.println("Nuevo punto recibido: " + point);
        return point;
    }
}
