package com.liftlogixclient;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.liftlogixclient.R;

public class ExerciseDetailsActivity extends AppCompatActivity {

    private static final String YOUTUBE_API_KEY = "YOUR_API_KEY";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_exercise_details);

        String name = getIntent().getStringExtra("name");
        String description = getIntent().getStringExtra("description");
        String videoUrl = getIntent().getStringExtra("videoUrl");

        TextView textViewName = findViewById(R.id.textViewName);
        TextView textViewDescription = findViewById(R.id.textViewDescription);

        textViewName.setText(name);
        textViewDescription.setText(description);

        WebView webView = findViewById(R.id.webView);
        webView.loadData(videoUrl, "text/html", "utf-8");
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebChromeClient(new WebChromeClient());

        FloatingActionButton floatingActionButton = findViewById(R.id.exerciseDetails_fab);
        floatingActionButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, ExerciseListActivity.class);
            startActivity(intent);
            finish();
        });
    }
}