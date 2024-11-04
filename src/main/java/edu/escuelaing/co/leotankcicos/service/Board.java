package edu.escuelaing.co.leotankcicos.service;

import org.springframework.stereotype.Component;

@Component
public class Board {

    private String[][] boxes;

    public Board(String[][] boxes){
        this.boxes = new String[][]{
            {
                "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"
            },
            {
                "1", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "1"
            },
            {
                "1", "0", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"
            },
            {
                "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "1"
            },
            {
                "1", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "1"
            },
            {
                "1", "0", "0", "0", "1", "0", "0", "1", "0", "0", "0", "1", "0", "0", "1"
            },
            {
                "1", "0", "0", "0", "1", "0", "0", "1", "0", "0", "0", "0", "1", "0", "1"
            },
            {
                "1", "0", "0", "0", "0", "0", "0", "0", "0", "1", "1", "0", "0", "0", "1"
            },
            {
                "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"
            },
            {
                "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"
            }
        };
    }

    public String getValue(int x, int y){
        return boxes[x][y];
    }

    public void putTank(String username, int x, int y){
        boxes[x][y] = username;
    }

    public void clearBox(int x, int y){
        boxes[x][y] = null;
    }

    public String[][] getBoxes(){
        return boxes;
    }
}
