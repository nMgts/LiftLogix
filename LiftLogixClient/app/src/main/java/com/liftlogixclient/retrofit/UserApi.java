package com.liftlogixclient.retrofit;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface UserApi {

    @GET("/api/user/image/{user_id}")
    Call<ResponseBody> getUserImage(@Header("Authorization") String token, @Path("user_id") long userId);

    @POST("/api/client/unsubscribe/{client_id}")
    Call<Void> unsubscribeUserFromCoach(
            @Path("client_id") long clientId,
            @Header("Authorization") String token
    );
}
