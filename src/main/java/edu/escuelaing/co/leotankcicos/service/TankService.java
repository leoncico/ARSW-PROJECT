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
    private Board board;

    @Autowired
    public TankService(TankRepository tankRepository, Board board){
        this.tankRepository = tankRepository;
        this.board = board;
        initialConfig();
    }

    private void initialConfig(){
        
        defaultPositions.add(new int[]{1,8});
        defaultPositions.add(new int[]{13,8});
        defaultPositions.add(new int[]{13,1});
        defaultPositions.add(new int[]{1,1});

        defaultColors.add("#a569bd");
        defaultColors.add("#f1948a");
        defaultColors.add("#f1c40f");
        defaultColors.add("#1e8449");
    }

    public Tank saveTank(String name) throws Exception {
        if(tankRepository.findById(name).isPresent()){
            throw new Exception("Tank with this name already exists");
        }

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
        return tank;
    }

    public Tank updateTankPosition(Tank tank, int x, int y, int newX, int newY) throws Exception { 
        String[][] boxes = board.getBoxes();
        String box = boxes[newY][newX];
        synchronized(box){
            if(box.equals("0")){
                System.out.println("initialx" + tank.getPosx() + "initialy" + tank.getPosy());
                board.putTank(tank.getName(), newX, newY);
                board.clearBox(y, x);
                tank.setPosx(newX);
                tank.setPosy(newY);
                tankRepository.save(tank);
                boxes = board.getBoxes();
                printBoard(boxes);
                System.out.println("siiiiiiiiiiiiiiiiiiix" + tank.getPosx() + "aaay" + tank.getPosy());
            }else{
                System.out.println("This box is already occupied by:" + box);
                throw new Exception("This box is already occupied" + box);
            }
        }
        
        return tank;
    }
    public void printBoard(String [][] boxes) {
        for (String[] row : boxes) {
            for (String cell : row) {
                System.out.print(cell + " ");
            }
            System.out.println();
        }
    }


    public void moveTank(){

    }

    public String[][] getBoard() {
        return board.getBoxes();
    }
}
