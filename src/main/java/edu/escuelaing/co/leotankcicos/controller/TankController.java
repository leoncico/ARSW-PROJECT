package edu.escuelaing.co.leotankcicos.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.service.TankService;
import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")  // Base path para todas las rutas
public class TankController {

    private final TankService tankService;
    private Map<Integer,Tank> tanks = new HashMap<>();
    private int tankId = 0;

    @Autowired
    public TankController(TankService tankService){
        this.tankService = tankService;
    }

    @PostMapping("/matches/login")
    public ResponseEntity<Tank> createTank(@RequestParam String username, HttpSession session) {
        // Almacenar el username en la sesión
        session.setAttribute("username", username);
        Tank newTank = tankService.saveTank(username);
        tanks.put(newTank.getId(), newTank);
        return new ResponseEntity<>(newTank, HttpStatus.CREATED);
    }

    @GetMapping("/matches/tanques")
    public ResponseEntity<List<Tank>> getAllTanks() {
        List<Tank> tanks = tankService.getAllTanks();
        return new ResponseEntity<>(tanks, HttpStatus.OK);
    }

    @GetMapping("/matches/username")
    public ResponseEntity<String> getUsername(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username != null) {
            return new ResponseEntity<>(username, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Username not found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/tanks/{id}/move")
    public ResponseEntity<Tank> moveTank(@PathVariable int id, @RequestParam String direction) {
        Tank tank = tanks.get(id);
        if(tank != null) {
            if (direction.equals("left")) {
                tank.setPosx(tank.getPosx() - 1);
                tank.setRotation(-90);
            } else if (direction.equals("right")) {
                tank.setPosx(tank.getPosx() + 1);
                tank.setRotation(90);
            } else if (direction.equals("up")) {
                tank.setPosy(tank.getPosy() - 1);
                tank.setRotation(0);
            } else if (direction.equals("down")) {
                tank.setPosy(tank.getPosy() + 1);
                tank.setRotation(180);
            }
        }else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        //Tank updatedTank = tankService.updateTank(tank);
        return new ResponseEntity<>(tank, HttpStatus.OK);
    }

    @GetMapping("/tanks/{id}")
    public ResponseEntity<Tank> getTank(@PathVariable int id) {
        Tank tank = tankService.getTankById(id);
        if (tank == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(tank, HttpStatus.OK);
    }

    @PostMapping("/create")
    public Tank createTank() {
        Tank tank = new Tank(tankId++, 1, 1, "#4CAF50",0);
        tanks.put(tank.getId(), tank);
        return tank;
    }

    @GetMapping("/tanks")
    public Collection<Tank> obtenerTanks() {
        return tanks.values();
    }

}

