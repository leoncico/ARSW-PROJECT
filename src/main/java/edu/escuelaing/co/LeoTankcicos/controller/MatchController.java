package edu.escuelaing.co.leotankcicos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MatchController {
    
    @GetMapping("/matches")
    public String renderLobby(){
        return "lobby";
    }
}
