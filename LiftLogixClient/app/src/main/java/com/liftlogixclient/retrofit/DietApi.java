package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Diet;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;

public interface DietApi {

    @GET("/api/diet/{client_id}")
    Call<Diet> getClientDiet(@Header("Authorization") String token, @Path("client_id") long clientId);
}
