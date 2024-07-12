package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.adapter.CoachAdapter;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.CoachApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CoachesActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private long user_id, coach_id;
    private boolean isAssigned;
    private String token;

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

        recyclerView = findViewById(R.id.coachList_rv);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

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
                        populateListView(response.body());
                    }

                    @Override
                    public void onFailure(Call<List<Coach>> call, Throwable throwable) {
                        Toast.makeText(CoachesActivity.this, "Failed to load coaches", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void populateListView(List<Coach> coachList) {
        CoachAdapter coachAdapter = new CoachAdapter(coachList, user_id, isAssigned, coach_id, token);
        recyclerView.setAdapter(coachAdapter);
    }

}