package edu.escuelaing.co.leotankcicos.model;

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
        boxes[y][x] = username;
    }

    public void clearBox(int x, int y){
        boxes[x][y] = "0";
    }

    public String[][] getBoxes(){
        return boxes;
    }

    public void clearBoard(){
        for(int i=0;i< boxes.length ;i++){
            for(int j=0;j< boxes[0].length ;j++){
                if(!boxes[i][j].equals("0") && !boxes[i][j].equals("1")){
                    clearBox(i,j);
                }  
            }
        }
    }
}
