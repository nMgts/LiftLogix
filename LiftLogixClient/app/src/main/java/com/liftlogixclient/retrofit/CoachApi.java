package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Coach;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface CoachApi {

    @GET("/api/coach/all")
    Call<List<Coach>> getAllCoaches(@Header("Authorization") String token);

    @POST("/api/client/assign/{client_id}/{coach_id}")
    Call<Void> assignUserToCoach(@Header("Authorization") String token, @Path("client_id") long userId, @Path("coach_id") long coachId);

    @POST("/api/client/unsubscribe/{client_id}")
    Call<Void> unsubscribeFromCoach(@Header("Authorization") String token, @Path("client_id") long userId);

}
