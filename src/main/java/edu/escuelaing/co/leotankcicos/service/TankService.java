package edu.escuelaing.co.leotankcicos.service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import edu.escuelaing.co.leotankcicos.model.Board;
import edu.escuelaing.co.leotankcicos.model.Bullet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import edu.escuelaing.co.leotankcicos.model.Tank;
import edu.escuelaing.co.leotankcicos.repository.TankRepository;

@Service
public class TankService {

    SimpMessagingTemplate msgt;

    private Queue<int[]> defaultPositions = new LinkedList<>();
    private Queue<String> defaultColors = new LinkedList<>();

    private TankRepository tankRepository;
    private Board board;

    private final Object bulletLock = new Object();
    private static final int MAX_PLAYERS = 3;

    private final AtomicInteger bulletId;
    private final ConcurrentHashMap<Integer, Bullet> bullets;

    @Autowired
    public TankService(TankRepository tankRepository, Board board, SimpMessagingTemplate msgt) {
        this.tankRepository = tankRepository;
        this.board = board;
        bullets = new ConcurrentHashMap<>();
        bulletId = new AtomicInteger(0);
        initialConfig();
        this.msgt = msgt;
    }

    private void initialConfig() {

        defaultPositions.add(new int[]{1, 8});
        defaultPositions.add(new int[]{13, 8});
        defaultPositions.add(new int[]{13, 1});
        defaultPositions.add(new int[]{1, 1});

        defaultColors.add("#fa0a0a");
        defaultColors.add("#001ba1");
        defaultColors.add("#f1c40f");
        defaultColors.add("#0c7036");
    }

    public synchronized Tank saveTank(String name) throws Exception {

        if (tankRepository.count() >= MAX_PLAYERS) {
            throw new Exception("The room is full");
        }
        if (tankRepository.findById(name).isPresent() || name.equals("1") || name.equals("0")) {
            throw new Exception("Tank with this name already exists or is invalid");
        }
        int[] position = defaultPositions.poll();
        Tank newTank = new Tank(position[0], position[1], defaultColors.poll(), 0, name);
        board.putTank(name, position[0], position[1]);
        tankRepository.save(newTank);
        return newTank;
    }

    public List<Tank> getAllTanks() {
        return new ArrayList<>(tankRepository.findAll());
    }

    public Tank getTankById(String username) {
        Tank tank = null;
        if (tankRepository.findById(username).isPresent()) {
            tank = tankRepository.findById(username).get();
        }
        return tank;
    }

    public Tank updateTankPosition(String username, int x, int y, int newX, int newY, int rotation) throws Exception {
        Tank tank = tankRepository.findById(username).orElse(null);
        if (tank == null) {
            return null;
        }
        synchronized (board.getLock(newX, newY)) {
            synchronized(board.getLock(x, y)) {
                String[][] boxes = board.getBoxes();
                String box = boxes[newY][newX];
                if (box.equals("0")) {
                    board.clearBox(x, y);
                    board.putTank(tank.getName(), newX, newY);
                    tank.setPosx(newX);
                    tank.setPosy(newY);
                    tank.setRotation(rotation);
                    tankRepository.save(tank);
                } else {
                    System.out.println("This box is already occupied by: " + box);
                    throw new Exception("This box is already occupied by: " + box);
                }
            }
        }
        msgt.convertAndSend("/topic/matches/1/movement", tank);
        printBoard(getBoard());
        return tank;
    }

    public void printBoard(String[][] boxes) {
        for (String[] row : boxes) {
            for (String cell : row) {
                System.out.print(cell + " ");
            }
            System.out.println();
        }
    }

    public Bullet shoot(String username) {
        Tank tank = tankRepository.findById(username).orElse(null);
        if (tank == null) {
            return null;
        }
    
        Bullet bullet;
        synchronized (bulletLock) {
            bullet = new Bullet(
                    bulletId.getAndIncrement(),                
                    tank.getPosx(),
                    tank.getPosy(),
                    tank.getRotation(),
                    true,
                    username
            );
            bullets.put(bullet.getId(), bullet);
        }
        startBulletMovement(bullet);
        return bullet;
    }

    public Bullet getBulletPosition(int bulletId) {
        return bullets.get(bulletId);
    }

    private void startBulletMovement(Bullet bullet) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                moveBullet(bullet);
            }
        }).start();
    }

    private void moveBullet(Bullet bullet) {
        while (bullet.isAlive()) {
            int newX = bullet.getX();
            int newY = bullet.getY();

            switch (bullet.getDirection()) {
                case -90: // Arriba
                    newY = bullet.getY() - 1;
                    break;
                case 0: // Derecha
                    newX = bullet.getX() + 1;
                    break;
                case 90: // Abajo
                    newY = bullet.getY() + 1;
                    break;
                case 180: // Izquierda
                    newX = bullet.getX() - 1;
                    break;
            }

            if (isOutOfBounds(newX, newY)) {
                bullet.setAlive(false);
                break;
            }

            bullet.setX(newX);
            bullet.setY(newY);

            List<Tank> tanks = tankRepository.findAll();

            boolean collision = false;
            for (Tank tank : tanks) {
                if (!tank.getName().equals(bullet.getTankId())) { // No golpear al propio tanque
                    if (checkCollision(bullet, tank)) {
                        collision = true;
                        handleCollision(bullet, tank);
                        break;
                    }
                }
            }

            if (collision) {
                bullet.setAlive(false);
                break;
            }

            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
                break;
            }
        }
    }

    private boolean isOutOfBounds(int x, int y) {
        String[][] boxes = board.getBoxes();
        boolean flag = false;
        if( x < 0 || x >= boxes[0].length || y < 0 || y >= boxes.length || boxes[y][x].equals("1")){
            flag=true;
        }
        return flag;
    }

    private boolean checkCollision(Bullet bullet, Tank tank) {
        // Comprobar si la bala está lo suficientemente cerca del tanque
        return Math.abs(tank.getPosx() - bullet.getX()) < 1
                && Math.abs(tank.getPosy() - bullet.getY()) < 1;
    }

    private void handleCollision(Bullet bullet, Tank tank) {
        // Eliminar el tanque del repositorio y limpiar la posición en el tablero
        tankRepository.delete(tank);
        board.clearBox(tank.getPosy(), tank.getPosx());
        msgt.convertAndSend("/topic/matches/1/bullets", board.getBoxes());
        msgt.convertAndSend("/topic/matches/1/collisionResult", tank);
        System.out.println("¡Colisión! Tanque " + tank.getName() + " ha sido golpeado");

        Tank winner = checkVictory();
        if (winner != null) {
            announceVictory(winner);
        }
    }

    public synchronized void handleWinner() {
        Tank winner = checkVictory();
        if (winner != null) {
            announceVictory(winner);
        }
    }

    public String[][] getBoard() {
        return board.getBoxes();
    }

    private Tank checkVictory() {
        List<Tank> activeTanks = tankRepository.findAll();
        if (activeTanks.size() == 1) {
            return activeTanks.get(0);
        }
        return null;
    }

    private void announceVictory(Tank winner) {
        System.out.println("¡El ganador es: " + winner.getName() + "!");
        tankRepository.deleteAll();
        board.clearBoard();
        msgt.convertAndSend("/topic/matches/1/winner", winner);
    }

    public void reset() {
        tankRepository.deleteAll();
        board.clearBoard();
        bullets.clear();
        initialConfig();
    }
}
