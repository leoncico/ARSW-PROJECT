package edu.escuelaing.co.leotankcicos.service;

import java.util.*;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.repository.TankRepository;

@Service
public class TankService {

    private Queue<int[]> defaultPositions = new LinkedList<>();
    private Queue<String> defaultColors = new LinkedList<>();

    private TankRepository tankRepository;

    @Autowired
    public TankService(TankRepository tankRepository){
        this.tankRepository = tankRepository;
        initialConfig();
    }

    private void initialConfig(){
        defaultPositions.add(new int[]{1,13});
        defaultPositions.add(new int[]{8,1});
        defaultPositions.add(new int[]{8,13});
        defaultPositions.add(new int[]{1,1});

        defaultColors.add("#a569bd");
        defaultColors.add("#f1948a");
        defaultColors.add("#f1c40f");
        defaultColors.add("#1e8449");
    }

    public Tank saveTank(String name) {
        int[] position = defaultPositions.poll();
        Tank newTank = new Tank(position[0], position[1], defaultColors.poll(), 0, name);
        tankRepository.save(newTank);
        return newTank;
    }

    public List<Tank> getAllTanks() {
        return new ArrayList<>(tankRepository.findAll());
    }

    public Tank getTankById(String username) {
        Tank tank = null;
        if(tankRepository.findById(username).isPresent()){
            tank = tankRepository.findById(username).get(); 
        }
        System.out.println(tank.toString());
        return tank;
    }

    public Tank updateTankPosition(Tank tank, int posX, int posY) {
        tank.setPosx(posX);
        tank.setPosy(posY);
        tankRepository.save(tank);
        return tank;
    }
}
