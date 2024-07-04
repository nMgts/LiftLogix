package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

public class DashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        CardView logout = findViewById(R.id.cardViewLogout);
        logout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                logout(v);
            }
        });

        CardView coachesList = findViewById(R.id.cardViewRegistration);
        coachesList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(DashboardActivity.this, CoachesActivity.class);
                startActivity(intent);
                finish();
            }
        });

        CardView exerciseLibrary = findViewById(R.id.cardViewLibrary);
        exerciseLibrary.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(DashboardActivity.this, ExerciseListActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }

    public void logout(View v) {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(DashboardActivity.this);
        SharedPreferences.Editor editor = preferences.edit();
        editor.clear();
        editor.apply();

        Intent intent = new Intent(this, LoginActivity.class);
        intent.putExtra("logout", "Logout successful");
        startActivity(intent);
        finish();
    }
}