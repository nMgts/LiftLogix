package com.liftlogixclient;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RatingBar;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.models.Opinion;
import com.liftlogixclient.retrofit.OpinionApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.time.LocalDateTime;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddOpinionActivity extends AppCompatActivity {
    private EditText opinionDescriptionInput;
    private RatingBar ratingBar;
    private long coachId, clientId;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_opinion);

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        coachId = getIntent().getLongExtra("coachId", -1);
        clientId = getIntent().getLongExtra("clientId", -1);
        token = preferences.getString("accessToken", "");

        FloatingActionButton backButton = findViewById(R.id.backButton);
        opinionDescriptionInput = findViewById(R.id.opinionDescriptionInput);
        ratingBar = findViewById(R.id.ratingBar);
        Button addOpinionButton = findViewById(R.id.addOpinionButton);

        backButton.setOnClickListener(v -> finish());

        addOpinionButton.setOnClickListener(v -> addOpinion());
    }

    private void addOpinion() {
        String description = opinionDescriptionInput.getText().toString().trim();
        double rating = ratingBar.getRating();

        if (description.isEmpty()) {
            Toast.makeText(this, "Opis nie może być pusty!", Toast.LENGTH_SHORT).show();
            return;
        }

        Opinion opinion = new Opinion();
        opinion.setId(0L);
        opinion.setCoachId(coachId);
        opinion.setClientId(clientId);
        opinion.setRating(rating);
        opinion.setDescription(description);
        opinion.setCreatedAt(LocalDateTime.now());

        RetrofitService retrofitService = new RetrofitService();
        OpinionApi opinionApi = retrofitService.getRetrofit().create(OpinionApi.class);
        Call<ResponseBody> call = opinionApi.addOpinion("Bearer " + token, opinion);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AddOpinionActivity.this, "Opinia dodana!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddOpinionActivity.this, "Błąd dodawania opinii", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(AddOpinionActivity.this, "Błąd sieci!", Toast.LENGTH_SHORT).show();
            }
        });
    }
}