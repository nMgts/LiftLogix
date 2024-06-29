package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Coach;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface CoachApi {

    @GET("/api/coach/all")
    Call<List<Coach>> getAllCoaches();

    @GET("/api/coach/{id}")
    Call<Coach> getCoach();

    @POST("/api/user/assign/{user_id}/{coach_id}")
    Call<Void> assignUserToCoach(@Path("user_id") long userId, @Path("coach_id") long coachId);

    @POST("/api/user/unsubscribe/{user_id}")
    Call<Void> unsubscribeFromCoach(@Path("user_id") long userId);

}
