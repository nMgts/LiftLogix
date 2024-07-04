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
import java.util.Map;

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
        String url = "http://192.168.1.17:8080/api/auth/login";  //http://192.168.1.17:8080 https://liftlogix-w8or.onrender.com/api/auth/login

        HashMap<String, String> params = new HashMap<>();
        params.put("email", email_et.getText().toString());
        params.put("password", password_et.getText().toString());

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, new JSONObject(params), new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject jsonObject) {
                try {
                    String role = jsonObject.getString("role");
                    String accessToken = jsonObject.getString("token");
                    String refreshToken = jsonObject.getString("refreshToken");

                    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(LoginActivity.this);
                    SharedPreferences.Editor editor = preferences.edit();

                    editor.putString("role", role);
                    editor.putString("accessToken", accessToken);
                    editor.putString("refreshToken", refreshToken);

                    editor.apply();

                    if (isValidRole(role)) {
                        getUserDetails();
                    } else {
                        Toast.makeText(getApplicationContext(), "Login failed", Toast.LENGTH_SHORT).show();
                        editor.clear();
                        editor.apply();
                    }

                } catch (JSONException e) {
                    e.printStackTrace();
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

    private void getUserDetails() {
        String url = "http://192.168.1.17:8080/api/user/details";

        String accessToken = PreferenceManager.getDefaultSharedPreferences(LoginActivity.this)
                .getString("accessToken", "");

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject jsonObject) {
                        try {
                            long id = jsonObject.getLong("id");
                            String firstName = jsonObject.getString("first_name");
                            String lastName = jsonObject.getString("last_name");
                            String email = jsonObject.getString("email");
                            String role = jsonObject.getString("role");
                            boolean isAssigned = jsonObject.getBoolean("assignedToCoach");
                            long coachId = jsonObject.getLong("coach_id");

                            SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(LoginActivity.this);
                            SharedPreferences.Editor editor = preferences.edit();
                            editor.putLong("id", id);
                            editor.putString("first_name", firstName);
                            editor.putString("last_name", lastName);
                            editor.putString("email", email);
                            editor.putString("role", role);
                            editor.putBoolean("isAssigned", isAssigned);
                            editor.putLong("coach_id", coachId);
                            editor.apply();

                            Toast.makeText(getApplicationContext(), "Welcome " + firstName, Toast.LENGTH_SHORT).show();

                            Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
                            startActivity(intent);
                            finish();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                volleyError.printStackTrace();
            }
        }) {
            @Override
            public Map<String, String> getHeaders() {
                HashMap<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + accessToken);
                return headers;
            }
        };

        RequestQueue queue = Volley.newRequestQueue(LoginActivity.this);
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

     private boolean isValidRole(String role) {
         return role.equals("CLIENT");
     }
}