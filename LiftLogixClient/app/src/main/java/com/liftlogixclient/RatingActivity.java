package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
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
    private long coachId, clientId;
    private String token;
    private boolean clientHasOpinion;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rating);

        FloatingActionButton floatingActionButton = findViewById(R.id.ratingList_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, CoachesActivity.class);
            startActivity(intent);
        });

        coachId = getIntent().getLongExtra("coachId", -1);
        clientId = getIntent().getLongExtra("clientId", -1);
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        token = preferences.getString("accessToken", "");

        recyclerView = findViewById(R.id.recyclerViewOpinions);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        loadOpinions();
    }

    private void loadOpinions() {
        RetrofitService retrofitService = new RetrofitService();
        OpinionApi opinionApi = retrofitService.getRetrofit().create(OpinionApi.class);
        opinionApi.getOpinionsByCoach(("Bearer " + token), coachId)
            .enqueue(new Callback<List<Opinion>>() {
            @Override
            public void onResponse(Call<List<Opinion>> call, Response<List<Opinion>> response) {
                List<Opinion> opinions = response.body();
                opinionAdapter = new OpinionAdapter(opinions);
                recyclerView.setAdapter(opinionAdapter);

                if (opinions != null && !opinions.isEmpty()) {
                    for (Opinion opinion : opinions) {
                        if (opinion.getClientId() == clientId) {
                            clientHasOpinion = true;
                            break;
                        }
                    }
                }
                loadHistory();
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

                    if (!clientHasOpinion && historyExists) {
                        Button addOpinionButton = findViewById(R.id.addOpinionButton);

                        addOpinionButton.setVisibility(View.VISIBLE);
                        addOpinionButton.setOnClickListener(view -> {
                            Intent intent = new Intent(RatingActivity.this, AddOpinionActivity.class);
                            intent.putExtra("coachId", coachId);
                            intent.putExtra("clientId", clientId);
                            startActivity(intent);
                        });
                    }
                }
            }

            @Override
            public void onFailure(Call<Boolean> call, Throwable throwable) {
                Toast.makeText(RatingActivity.this, "Błąd ładowania historii", Toast.LENGTH_SHORT).show();
            }
        });
    }
}