 package com.liftlogixclient;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.liftlogixclient.helpers.StringHelper;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

 public class LoginActivity extends AppCompatActivity {
    EditText email_et, password_et;
    Button login_button;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        email_et = findViewById(R.id.email_et);
        password_et = findViewById(R.id.password_et);

        login_button = findViewById(R.id.login_button);

        login_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                authenticateUser();
            }
        });
    }

    public void authenticateUser() {
        if (!validateEmail() || !validatePassword()) {
            return;
        }

        RequestQueue queue = Volley.newRequestQueue(LoginActivity.this);
        String url = "https://liftlogix-w8or.onrender.com/api/auth/login";

        HashMap<String, String> params = new HashMap<>();
        params.put("email", email_et.getText().toString());
        params.put("password", password_et.getText().toString());

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, new JSONObject(params), new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject jsonObject) {
                try {
                    String first_name = (String) jsonObject.get("first_name");
                    String last_name = (String) jsonObject.get("last_name");
                    String email = (String) jsonObject.get("email");
                    long id = jsonObject.getLong("id");
                    boolean isAssigned = jsonObject.getBoolean("assignedToCoach");
                    long coachId = -1;
                    if (isAssigned) {
                        JSONObject coachObject = jsonObject.getJSONObject("coach");
                        coachId = coachObject.getLong("id");
                    }

                    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(LoginActivity.this);
                    SharedPreferences.Editor editor = preferences.edit();

                    editor.putString("first_name", first_name);
                    editor.putString("last_name", last_name);
                    editor.putString("email", email);
                    editor.putLong("id", id);
                    editor.putBoolean("isAssigned", isAssigned);
                    editor.putLong("coach_id", coachId);

                    editor.apply();

                    Toast.makeText(getApplicationContext(), "Welcome " + first_name, Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
                    //intent.putExtra("first_name", first_name);
                    //intent.putExtra("last_name", last_name);
                    //intent.putExtra("email", email);
                    //intent.putExtra("id", id);
                    //intent.putExtra("isAssigned", isAssigned);
                    //intent.putExtra("coach_id", coachId);
                    startActivity(intent);
                    finish();
                } catch (JSONException e) {
                    e.printStackTrace();
                    System.out.println(e.getMessage());
                }
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                volleyError.printStackTrace();
                System.out.println(volleyError.getMessage());
                Toast.makeText(LoginActivity.this, "Login failed", Toast.LENGTH_LONG).show();
            }
        });
        queue.add(jsonObjectRequest);
    }

    public void goToRegister(View view) {
        Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
        startActivity(intent);
        finish();
    }

     public boolean validateEmail() {
         String email = email_et.getText().toString();

         if (email.isEmpty()) {
             email_et.setError("Email name cannot be empty");
             return false;
         } else if (!StringHelper.registerEmailValidationPattern(email)) {
             email_et.setError("Please enter a valid email");
             return false;
         }else {
             email_et.setError(null);
             return true;
         }
     }

     public boolean validatePassword() {
         String password = password_et.getText().toString();

         if (password.isEmpty()) {
             password_et.setError("Password cannot be empty");
             return false;
         } else {
             password_et.setError(null);
             return true;
         }
     }
}