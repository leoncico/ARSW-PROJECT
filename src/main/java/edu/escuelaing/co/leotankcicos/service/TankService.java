package edu.escuelaing.co.leotankcicos.service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.repository.TankRepository;

@Service
public class TankService {

    private Map<Integer, Tank> tanks = new HashMap<>();
    private AtomicInteger tankId = new AtomicInteger(0);

    public Tank saveTank(String name) {
        Tank newTank = new Tank();
        newTank.setId(tankId.incrementAndGet());
        newTank.setName(name);
        newTank.setColor("defaultColor");
        newTank.setAlive(true);
        newTank.setPosx(0);
        newTank.setPosy(0);
        newTank.setRotation(0);

        tanks.put(newTank.getId(), newTank);
        return newTank;
    }

    public List<Tank> getAllTanks() {
        return new ArrayList<>(tanks.values());
    }

    public Tank getTankById(int id) {
        return tanks.get(id);
    }

    public Tank updateTank(Tank tank) {
        if (tanks.containsKey(tank.getId())) {
            tanks.put(tank.getId(), tank);
            return tank;
        }
        return null;
    }
}
