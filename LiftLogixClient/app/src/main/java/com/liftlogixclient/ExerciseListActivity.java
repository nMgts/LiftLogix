package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.adapter.CoachAdapter;
import com.liftlogixclient.adapter.ExerciseAdapter;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.models.Exercise;
import com.liftlogixclient.retrofit.ExerciseApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ExerciseListActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_exercise_list);

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        token = preferences.getString("accessToken", "");

        recyclerView = findViewById(R.id.exerciseList_rv);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));

        FloatingActionButton floatingActionButton = findViewById(R.id.exerciseList_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, DashboardActivity.class);
            startActivity(intent);
        });

        fetchExercises();
    }

    private void fetchExercises() {
        RetrofitService retrofitService = new RetrofitService();
        ExerciseApi exerciseApi = retrofitService.getRetrofit().create(ExerciseApi.class);
        exerciseApi.getAllExercises("Bearer " + token)
                .enqueue(new Callback<List<Exercise>>() {
            @Override
            public void onResponse(Call<List<Exercise>> call, Response<List<Exercise>> response) {
                populateGridView(response.body());
            }

            @Override
            public void onFailure(Call<List<Exercise>> call, Throwable t) {
                Log.e("ExerciseListActivity", "Error: " + t.getMessage());
            }
        });
    }

    private void populateGridView(List<Exercise> exerciseList) {
        ExerciseAdapter exerciseAdapter = new ExerciseAdapter(exerciseList);
        recyclerView.setAdapter(exerciseAdapter);
    }
}