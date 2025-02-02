package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.adapter.CoachAdapter;
import com.liftlogixclient.models.Application;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.ApplicationApi;
import com.liftlogixclient.retrofit.CoachApi;
import com.liftlogixclient.retrofit.OpinionApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CoachesActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private long user_id, coach_id;
    private boolean isAssigned;
    private String token;
    private List<Coach> coachList;
    private List<Application> applicationList;
    private Map<Long, Double> coachRatingsMap = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_coaches);

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);

        user_id = preferences.getLong("id", -1);
        isAssigned = preferences.getBoolean("isAssigned", false);
        coach_id = preferences.getLong("coach_id", -1);
        token = preferences.getString("accessToken", "");

        //Toast.makeText(CoachesActivity.this, user_id + " " + isAssigned + " " + coach_id, Toast.LENGTH_SHORT).show();

        if (isAssigned) {
            recyclerView = findViewById(R.id.coachList_rv);
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
        } else {
            recyclerView = findViewById(R.id.coachList_rv);
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
        }

        FloatingActionButton floatingActionButton = findViewById(R.id.coachList_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, DashboardActivity.class);
            startActivity(intent);
        });

        loadCoaches();
    }

    private void loadCoaches() {
        RetrofitService retrofitService = new RetrofitService();
        CoachApi coachApi = retrofitService.getRetrofit().create(CoachApi.class);
        coachApi.getAllCoaches("Bearer " + token)
                .enqueue(new Callback<List<Coach>>() {
                    @Override
                    public void onResponse(Call<List<Coach>> call, Response<List<Coach>> response) {
                        if (response.isSuccessful()) {
                            coachList = response.body();
                            loadApplications();
                        } else {
                            Toast.makeText(CoachesActivity.this, "Nie udało się wczytać trenerów!", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Coach>> call, Throwable throwable) {
                        Toast.makeText(CoachesActivity.this, "Nie udało się wczytać trenerów", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void loadApplications() {
        RetrofitService retrofitService = new RetrofitService();
        ApplicationApi applicationApi = retrofitService.getRetrofit().create(ApplicationApi.class);
        applicationApi.getClientApplications("Bearer " + token)
                .enqueue(new Callback<List<Application>>() {

                    @Override
                    public void onResponse(Call<List<Application>> call, Response<List<Application>> response) {
                        if (response.isSuccessful()) {
                            applicationList = response.body();
                            loadCoachRatings();
                        } else {
                            Toast.makeText(CoachesActivity.this, "Nie udało się wczytać wniosków!", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Application>> call, Throwable throwable) {
                        Log.e("API Error", "Failed to load applications", throwable);
                        Toast.makeText(CoachesActivity.this, "Nie udało się wczytać wniosków", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void loadCoachRatings() {
        RetrofitService retrofitService = new RetrofitService();
        OpinionApi opinionApi = retrofitService.getRetrofit().create(OpinionApi.class);

        for (Coach coach : coachList) {
            opinionApi.getAverageRating("Bearer " + token, coach.getId())
                    .enqueue(new Callback<Double>() {
                        @Override
                        public void onResponse(Call<Double> call, Response<Double> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                coachRatingsMap.put(coach.getId(), response.body());
                                if (coachRatingsMap.size() == coachList.size()) {
                                    populateListView();
                                }
                            } else {
                                Toast.makeText(CoachesActivity.this, "Nie udało się wczytać ocen trenera!", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<Double> call, Throwable throwable) {
                            Log.e("API Error", "Failed to load Ratings", throwable);
                            Toast.makeText(CoachesActivity.this, "Nie udało się wczytać ocen trenera", Toast.LENGTH_SHORT).show();
                        }
                    });
        }
    }

    private void populateListView() {
        CoachAdapter coachAdapter = new CoachAdapter(coachList, applicationList, coachRatingsMap, user_id, coach_id, token);
        recyclerView.setAdapter(coachAdapter);
    }
}