package com.liftlogixclient;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.adapter.OpinionAdapter;
import com.liftlogixclient.models.Opinion;
import com.liftlogixclient.retrofit.CoachClientHistoryApi;
import com.liftlogixclient.retrofit.OpinionApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RatingActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private OpinionAdapter opinionAdapter;
    private long coachId;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rating);

        coachId = getIntent().getLongExtra("coachId", -1);
        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        token = sharedPreferences.getString("token", "");

        recyclerView = findViewById(R.id.recyclerViewOpinions);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        loadOpinions();
        loadHistory();
    }



    private void loadOpinions() {
        RetrofitService retrofitService = new RetrofitService();
        OpinionApi opinionApi = retrofitService.getRetrofit().create(OpinionApi.class);
        Call<List<Opinion>> call = opinionApi.getOpinionsByCoach("Bearer " + token, coachId);
        call.enqueue(new Callback<List<Opinion>>() {
            @Override
            public void onResponse(Call<List<Opinion>> call, Response<List<Opinion>> response) {
                List<Opinion> opinions = response.body();
                opinionAdapter = new OpinionAdapter(opinions);
                recyclerView.setAdapter(opinionAdapter);
            }

            @Override
            public void onFailure(Call<List<Opinion>> call, Throwable throwable) {
                Toast.makeText(RatingActivity.this, "Błąd ładowania opinii", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadHistory() {
        RetrofitService retrofitService = new RetrofitService();
        CoachClientHistoryApi historyApi = retrofitService.getRetrofit().create(CoachClientHistoryApi.class);
        Call<Boolean> call = historyApi.checkHistory(coachId, "Bearer " + token);
        call.enqueue(new Callback<Boolean>() {
            @Override
            public void onResponse(Call<Boolean> call, Response<Boolean> response) {
                if (response.isSuccessful()) {
                    boolean historyExists = response.body() != null && response.body();
                    opinionAdapter.setHistoryExists(historyExists);
                }
            }

            @Override
            public void onFailure(Call<Boolean> call, Throwable throwable) {
                Toast.makeText(RatingActivity.this, "Błąd ładowania historii", Toast.LENGTH_SHORT).show();
            }
        });
    }
}