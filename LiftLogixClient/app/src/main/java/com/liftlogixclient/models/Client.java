package com.liftlogixclient.models;

public class Client {
    private long id;
    private String first_name;
    private String last_name;
    private String email;
    private boolean assignedToCoach;
    private String image;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getFirst_name() {
        return first_name;
    }

    public void setFirst_name(String first_name) {
        this.first_name = first_name;
    }

    public String getLast_name() {
        return last_name;
    }

    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAssignedToCoach() {
        return assignedToCoach;
    }

    public void setAssignedToCoach(boolean assignedToCoach) {
        this.assignedToCoach = assignedToCoach;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
