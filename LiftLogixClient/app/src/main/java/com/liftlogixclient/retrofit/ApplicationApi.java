package com.liftlogixclient.retrofit;



import com.liftlogixclient.models.Application;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ApplicationApi {

    @GET("/api/application/my")
    Call<List<Application>> getClientApplications(
            @Header("Authorization") String token
    );

    @POST("/api/application/create")
    Call<Application> createApplication(
            @Header("Authorization") String token,
            @Body Application request
    );
}
