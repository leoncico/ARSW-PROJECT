package edu.escuelaing.co.leotankcicos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.repository.TankRepository;

@Service
public class TankService {
    
    TankRepository tankRepository;

    @Autowired
    public TankService(TankRepository tankRepository){
        this.tankRepository = tankRepository;
    }

    public Tank saveTank(String name){
        Tank newTank = new Tank();
        newTank.setName(name);
        newTank.setColor("defaultColor");
        newTank.setAlive(true);
        newTank.setPosition(new int[]{0,0});
        return tankRepository.save(newTank);
    }

    public List<Tank> getAllTanks() {
        return tankRepository.findAll();
    }
    
}
