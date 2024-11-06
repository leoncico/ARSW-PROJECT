package edu.escuelaing.co.leotankcicos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.escuelaing.co.leotankcicos.model.Bullet;
import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.service.TankService;
import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/tanks")
public class TankController {

    private final TankService tankService;

    @Autowired
    public TankController(TankService tankService){
        this.tankService = tankService;
    }

    //Crea los tanques
    @PostMapping("/login")
    public ResponseEntity<?> createTank(@RequestParam String username, HttpSession session) {
        session.setAttribute("username", username);
        Tank newTank;
        try {
            newTank = tankService.saveTank(username);
            return new ResponseEntity<>(newTank, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error saving tank: " + e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
        
    }

    //Obtiene todos los tanques
    @GetMapping
    public ResponseEntity<List<Tank>> getAllTanks() {
        List<Tank> tanks = tankService.getAllTanks();
        return new ResponseEntity<>(tanks, HttpStatus.OK);
    }

    // Ruta para obtener el nombre de usuario
    @GetMapping("/username")  
    public ResponseEntity<String> getUsername(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username != null) {
            return new ResponseEntity<>(username, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Username not found", HttpStatus.NOT_FOUND);
        }
    }

    // Mover tanque 
    @PutMapping("/{username}/move")
    public ResponseEntity<Tank> moveTank(@PathVariable String username, @RequestBody Map<String, Integer> moveRequest) {
        Tank tank = tankService.getTankById(username);
        if (tank == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Integer posX = moveRequest.get("posX");
        Integer posY = moveRequest.get("posY");
        Integer newPosX = moveRequest.get("newPosX");
        Integer newPosY = moveRequest.get("newPosY");
        Integer rotation = moveRequest.get("rotation");

        try {
            tank = tankService.updateTankPosition(tank, posX, posY, newPosX, newPosY, rotation);
            return new ResponseEntity<>(tank, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

    // Obtener un tanque específico
    @GetMapping("/{username}")  
    public ResponseEntity<Tank> getTank(@PathVariable String username) {
        Tank tank = tankService.getTankById(username);
        if (tank == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(tank, HttpStatus.OK);
    }

    @GetMapping("/board")
    public ResponseEntity<String[][]> getBoard() {
        String[][] board = tankService.getBoard();
        if (board == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(board, HttpStatus.OK);
    }

    @GetMapping("/bullets/{bulletId}/position")
    public ResponseEntity<Bullet> getBulletPosition(@PathVariable int bulletId) {
        Bullet bullet = tankService.getBulletPosition(bulletId);
        if (bullet == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(bullet, HttpStatus.OK);
    }

    @MessageMapping("/{username}/shoot")
    public void handleShootEvent(@DestinationVariable String username){
        System.out.println("Bala recibida: ");
        tankService.shoot(username);
    }

    @MessageMapping("/matches/1/winner")
    public void handleWinnerEvent(){
        tankService.handleWinner();
    }


}

