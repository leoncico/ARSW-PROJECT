package edu.escuelaing.co.leotankcicos.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tanks")
public class Tank {
    
    @Id
    private String id;
    private String color;
    private String name;
    private boolean alive;
    private int[] position;

    public Tank() {}

    public Tank(String name, int x, int y, String color) {
        this.name = name;
        this.position = new int[] {x, y};
        this.color = color;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isAlive() {
        return alive;
    }

    public void setAlive(boolean alive) {
        this.alive = alive;
    }

    public int[] getPosition() {
        return position;
    }

    public void setPosition(int[] position) {
        this.position = position;
    }
}