package edu.escuelaing.co.LeoTankcicos.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.service.TankService;
import jakarta.servlet.http.HttpSession;

@RestController
public class TankController {
    
    TankService tankService;
    private Map<Integer,Tank> tanks = new HashMap<>();

    @Autowired
    public TankController(TankService tankService){
        this.tankService = tankService;
    }

    @PostMapping("/matches/login")
    public ResponseEntity<Tank> createTank(@RequestParam String username, HttpSession session) {
        // Almacenar el username en la sesión
        session.setAttribute("username", username);
        Tank newTank = tankService.saveTank(username);
        return new ResponseEntity<>(newTank, HttpStatus.CREATED);
    }

    @GetMapping("/matches/tanks")
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


}

