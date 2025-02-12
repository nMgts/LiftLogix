package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Opinion;

import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface OpinionApi {

    @GET("/api/opinion/all/{coachId}")
    Call<List<Opinion>> getOpinionsByCoach(
            @Header("Authorization") String token,
            @Path("coachId") Long coachId
    );

    @GET("/api/opinion/average/{coachId}")
    Call<Double> getAverageRating(
            @Header("Authorization") String token,
            @Path("coachId") Long coachId
    );

    @POST("/api/opinion/add")
    Call<ResponseBody> addOpinion(
            @Header("Authorization") String token,
            @Body Opinion opinion
    );
}
