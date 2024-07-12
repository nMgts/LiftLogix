package com.liftlogixclient.retrofit;

import com.liftlogixclient.models.Exercise;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public interface ExerciseApi {
    @GET("/api/exercise/all")
    Call<List<Exercise>> getAllExercises(@Header("Authorization") String token);

    @GET("/api/exercise/{id}")
    Call<Exercise> getExerciseDetails(@Header("Authorization") String token, @Path("id") Long id);

    @GET("exercises/image/{id}")
    Call<ResponseBody> getImage(@Header("Authorization") String token, @Path("id") Long id);
}
