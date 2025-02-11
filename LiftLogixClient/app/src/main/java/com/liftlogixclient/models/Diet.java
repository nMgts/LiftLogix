package com.liftlogixclient.models;

public class Diet {
    private Long id;
    private int calories;
    private int carbs;
    private int fats;
    private int proteins;
    private String notes;
    private long client_id;

    public Diet() {}

    public Diet(Long id, int calories, int carbs, int fats, int proteins, String notes, long client_id) {
        this.id = id;
        this.calories = calories;
        this.carbs = carbs;
        this.fats = fats;
        this.proteins = proteins;
        this.notes = notes;
        this.client_id = client_id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getCarbs() {
        return carbs;
    }

    public void setCarbs(int carbs) {
        this.carbs = carbs;
    }

    public int getFats() {
        return fats;
    }

    public void setFats(int fats) {
        this.fats = fats;
    }

    public int getProteins() {
        return proteins;
    }

    public void setProteins(int proteins) {
        this.proteins = proteins;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public long getClient_id() {
        return client_id;
    }

    public void setClient_id(long client_id) {
        this.client_id = client_id;
    }
}
