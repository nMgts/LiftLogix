package com.liftlogixclient.retrofit;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Query;

public interface CoachClientHistoryApi {

    @GET("/api/coach-client-history/exists")
    Call<Boolean> checkHistory(
            @Query("coachId") Long coachId,
            @Header("Authorization") String token
    );
}
