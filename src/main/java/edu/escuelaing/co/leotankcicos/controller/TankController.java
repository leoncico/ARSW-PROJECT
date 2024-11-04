package edu.escuelaing.co.leotankcicos.controller;

import java.util.*;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        if (tank != null) {
            Integer posX = moveRequest.get("posX");
            Integer posY = moveRequest.get("posY");
            Integer newPosX = moveRequest.get("newPosX");
            Integer newPosY = moveRequest.get("newPosY");

            Tank updatedTank;
            try {
                updatedTank = tankService.updateTankPosition(tank, posX, posY, newPosX, newPosY);
                System.out.println(updatedTank.getPosx());
                System.out.println(updatedTank.getPosy());
                return new ResponseEntity<>(updatedTank, HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
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
}

