package com.liftlogixclient.models;

public class User {
    private long id;
    private String first_name;
    private String last_name;
    private String email;
    private String role;
    private boolean assignedToCoach;
    private long coach_id;

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isAssignedToCoach() {
        return assignedToCoach;
    }

    public void setAssignedToCoach(boolean assignedToCoach) {
        this.assignedToCoach = assignedToCoach;
    }

    public long getCoach_id() {
        return coach_id;
    }

    public void setCoach_id(long coach_id) {
        this.coach_id = coach_id;
    }
}
