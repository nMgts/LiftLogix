package com.liftlogixclient.models;

import java.time.LocalDateTime;

public class Application {
    private long id;
    private Client client;
    private Coach coach;
    private String description;
    private String status;
    private LocalDateTime submitted_date;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Coach getCoach() {
        return coach;
    }

    public void setCoach(Coach coach) {
        this.coach = coach;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmitted_date() {
        return submitted_date;
    }

    public void setSubmitted_date(LocalDateTime submitted_date) {
        this.submitted_date = submitted_date;
    }
}
