package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.models.Application;
import com.liftlogixclient.models.Client;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.ApplicationApi;
import com.liftlogixclient.retrofit.RetrofitService;

import java.time.LocalDateTime;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SendApplicationActivity extends AppCompatActivity {
    private EditText descriptionEditText;
    private Button submitButton;
    private long coachId, clientId;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_send_application);

        coachId = getIntent().getLongExtra("coachId", -1);
        clientId = getIntent().getLongExtra("clientId", -1);
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        token = preferences.getString("accessToken", "");

        FloatingActionButton floatingActionButton = findViewById(R.id.sendApp_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, CoachesActivity.class);
            startActivity(intent);
        });

        descriptionEditText = findViewById(R.id.descriptionEditText);
        submitButton = findViewById(R.id.submitButton);

        submitButton.setOnClickListener(v -> submitApplication());
    }

    private void submitApplication() {
        String description = descriptionEditText.getText().toString().trim();
        Application application = new Application();
        application.setDescription(description);
        Coach coach = new Coach();
        coach.setId(coachId);
        application.setCoach(coach);
        Client client = new Client();
        client.setId(clientId);
        application.setClient(client);
        application.setStatus("PENDING");
        application.setSubmitted_date(LocalDateTime.now());

        RetrofitService retrofitService = new RetrofitService();
        ApplicationApi applicationApi = retrofitService.getRetrofit().create(ApplicationApi.class);
        Call<Application> call = applicationApi.createApplication("Bearer " + token, application);

        call.enqueue(new Callback<Application>() {
            @Override
            public void onResponse(Call<Application> call, Response<Application> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SendApplicationActivity.this, "Zgłoszenie zostało wysłane", Toast.LENGTH_SHORT).show();
                    finish(); // Zakończ aktywność po wysłaniu zgłoszenia
                } else {
                    Toast.makeText(SendApplicationActivity.this, "Błąd wysyłania zgłoszenia", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Application> call, Throwable t) {
                Toast.makeText(SendApplicationActivity.this, "Błąd połączenia z serwerem", Toast.LENGTH_SHORT).show();
            }
        });
    }
}