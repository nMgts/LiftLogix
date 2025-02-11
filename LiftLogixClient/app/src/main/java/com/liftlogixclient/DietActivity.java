package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.models.Diet;
import com.liftlogixclient.retrofit.DietApi;
import com.liftlogixclient.retrofit.RetrofitService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DietActivity extends AppCompatActivity {
    private TextView dietDetails;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_diet);

        dietDetails = findViewById(R.id.diet_details);

        FloatingActionButton floatingActionButton = findViewById(R.id.diet_back_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, DashboardActivity.class);
            startActivity(intent);
        });

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);

        long clientId = preferences.getLong("id", -1);
        String token = preferences.getString("accessToken", "");

        if (clientId != -1) {
            fetchDiet(clientId, token);
        }
    }

    private void fetchDiet(long clientId, String token) {
        RetrofitService retrofitService = new RetrofitService();
        DietApi dietApi = retrofitService.getRetrofit().create(DietApi.class);
        Call<Diet> call = dietApi.getClientDiet("Bearer " + token, clientId);

        call.enqueue(new Callback<Diet>() {
            @Override
            public void onResponse(Call<Diet> call, Response<Diet> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Diet diet = response.body();
                    dietDetails.setText("Kalorie: " + diet.getCalories() + "\nWęglowodany: " + diet.getCarbs() +
                            "\nTłuszcze: " + diet.getFats() + "\nBiałko: " + diet.getProteins() +
                            "\nNotatki: " + diet.getNotes());
                } else {
                    dietDetails.setText("Nie masz ustanowionej diety");
                }
            }

            @Override
            public void onFailure(Call<Diet> call, Throwable t) {
                dietDetails.setText("Błąd podczas pobierania danych");
            }
        });
    }
}