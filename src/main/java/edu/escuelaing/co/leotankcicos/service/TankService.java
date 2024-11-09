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

@Service
public class TankService {

    SimpMessagingTemplate msgt;
    private Queue<int[]> defaultPositions = new LinkedList<>();
    private Queue<String> defaultColors = new LinkedList<>();
    private Board board;
    private final Object bulletLock = new Object();
    private static final int MAX_PLAYERS = 3;

    private final AtomicInteger bulletId;
    private final ConcurrentHashMap<Integer, Bullet> bullets;
    private final ConcurrentHashMap<String, Tank> tanks;

    @Autowired
    public TankService(Board board, SimpMessagingTemplate msgt) {
        this.board = board;
        this.bullets = new ConcurrentHashMap<>();
        this.tanks = new ConcurrentHashMap<>();
        this.bulletId = new AtomicInteger(0);
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
        if (tanks.size() >= MAX_PLAYERS) {
            throw new Exception("The room is full");
        }
        if (tanks.containsKey(name) || name.equals("1") || name.equals("0")) {
            throw new Exception("Tank with this name already exists or is invalid");
        }
        int[] position = defaultPositions.poll();
        Tank newTank = new Tank(position[0], position[1], defaultColors.poll(), 0, name);
        board.putTank(name, position[0], position[1]);
        tanks.put(name, newTank);
        return newTank;
    }

    public List<Tank> getAllTanks() {
        return new ArrayList<>(tanks.values());
    }

    public Tank getTankById(String username) {
        return tanks.get(username);
    }

    public Tank updateTankPosition(String username, int x, int y, int newX, int newY, int rotation) throws Exception {
        Tank tank = tanks.get(username);
        if (tank == null) {
            return null;
        }
        String[][] boxes = board.getBoxes();
        int firstX, firstY, secondX, secondY;
        if (y * boxes[0].length + x <= newY * boxes[0].length + newX) {
            firstX = x;
            firstY = y;
            secondX = newX;
            secondY = newY;
        } else {
            firstX = newX;
            firstY = newY;
            secondX = x;
            secondY = y;
        }
        synchronized (board.getLock(firstX, firstY)) {
            synchronized (board.getLock(secondX, secondY)) {
                boxes = board.getBoxes();
                if (!boxes[y][x].equals(username)) {
                    throw new Exception("Tank is no longer in the original position");
                }

                String box = boxes[newY][newX];
                if (!box.equals("0")) {
                    System.out.println("This box is already occupied by: " + box);
                    throw new Exception("This box is already occupied by: " + box);
                }

                board.clearBox(x, y);
                board.putTank(tank.getName(), newX, newY);
                tank.setPosx(newX);
                tank.setPosy(newY);
                tank.setRotation(rotation);
                tanks.put(username, tank);
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
        Tank tank = tanks.get(username);
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
        new Thread(() -> moveBullet(bullet)).start();
    }

    private void moveBullet(Bullet bullet) {
        while (bullet.isAlive()) {
            int newX = bullet.getX();
            int newY = bullet.getY();

            switch (bullet.getDirection()) {
                case -90 -> newY = bullet.getY() - 1;
                case 0 -> newX = bullet.getX() + 1;
                case 90 -> newY = bullet.getY() + 1;
                case 180 -> newX = bullet.getX() - 1;
            }

            if (isOutOfBounds(newX, newY)) {
                bullet.setAlive(false);
                break;
            }

            bullet.setX(newX);
            bullet.setY(newY);

            boolean collision = false;
            for (Tank tank : tanks.values()) {
                if (!tank.getName().equals(bullet.getTankId()) && checkCollision(bullet, tank)) {
                    collision = true;
                    handleCollision(bullet, tank);
                    break;
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
        return x < 0 || x >= boxes[0].length || y < 0 || y >= boxes.length || boxes[y][x].equals("1");
    }

    private boolean checkCollision(Bullet bullet, Tank tank) {
        return Math.abs(tank.getPosx() - bullet.getX()) < 1 && Math.abs(tank.getPosy() - bullet.getY()) < 1;
    }

    private void handleCollision(Bullet bullet, Tank tank) {
        tanks.remove(tank.getName());
        board.clearBox(tank.getPosx(), tank.getPosy());
        Map<String, String> response = new HashMap<>();
        response.put("tank", tank.getName());
        response.put("bulletId", String.valueOf(bullet.getId()));
        msgt.convertAndSend("/topic/matches/1/bullets", board.getBoxes());
        msgt.convertAndSend("/topic/matches/1/collisionResult", response);
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
        if (tanks.size() == 1) {
            return tanks.values().iterator().next();
        }
        return null;
    }

    private void announceVictory(Tank winner) {
        System.out.println("¡El ganador es: " + winner.getName() + "!");
        tanks.clear();
        board.clearBoard();
        msgt.convertAndSend("/topic/matches/1/winner", winner);
    }

    public void reset() {
        tanks.clear();
        board.clearBoard();
        bullets.clear();
        initialConfig();
    }
}
