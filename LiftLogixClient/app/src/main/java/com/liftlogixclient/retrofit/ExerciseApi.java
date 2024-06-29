package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Exercise;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public interface ExerciseApi {
    @GET("/api/exercise/all")
    Call<List<Exercise>> getAllExercises();

    @GET("/api/exercise/{id}")
    Call<Exercise> getExerciseDetails(@Path("id") Long id);

    @Multipart
    @POST("/api/exercise")
    Call<Exercise> addExercise(
            @Part("name") RequestBody name,
            @Part("description") RequestBody description,
            @Part("url") RequestBody url,
            @Part MultipartBody.Part image
    );

    @GET("exercises/image/{id}")
    Call<ResponseBody> getImage(@Path("id") Long id);
}
