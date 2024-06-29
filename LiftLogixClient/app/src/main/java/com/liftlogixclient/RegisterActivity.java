package com.liftlogixclient;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.gson.Gson;
import com.liftlogixclient.dto.UserRegisterDTO;
import com.liftlogixclient.helpers.StringHelper;

import java.lang.ref.ReferenceQueue;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {
    EditText first_name, last_name, email, password, confirm;
    Button register_button;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        first_name = findViewById(R.id.first_name);
        last_name = findViewById(R.id.last_name);
        email = findViewById(R.id.email);
        password = findViewById(R.id.password);
        confirm = findViewById(R.id.confirm);

        register_button = findViewById(R.id.register_button);

        register_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                processFormFields();
            }
        });
    }

    public void goToLogin(View view) {
        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
        startActivity(intent);
        finish();
    }

    public void processFormFields() {
        if (!validateFirstName() || !validateLastName() || !validateEmail() || !validatePasswordAndConfirm()) {
            return;
        }

        RequestQueue queue = Volley.newRequestQueue(RegisterActivity.this);
        String url = "https://liftlogix-w8or.onrender.com/api/auth/register";

        StringRequest stringRequest = new StringRequest(Request.Method.POST, url, new Response.Listener<String>() {

            @Override
            public void onResponse(String s) {
                if (s.equalsIgnoreCase("success")) {
                    first_name.setText(null);
                    last_name.setText(null);
                    email.setText(null);
                    password.setText(null);
                    confirm.setText(null);
                    Toast.makeText(RegisterActivity.this, "Register Successful", Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(RegisterActivity.this, "Registration Un-Successful: " + s, Toast.LENGTH_LONG).show();
                }

            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                String errorMessage = "Failed to connect with server";
                Toast.makeText(RegisterActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        }) {
            @Nullable
            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public byte[] getBody() throws AuthFailureError {
                UserRegisterDTO user = new UserRegisterDTO();
                user.setFirst_name(first_name.getText().toString());
                user.setLast_name(last_name.getText().toString());
                user.setEmail(email.getText().toString());
                user.setPassword(password.getText().toString());

                Gson gson = new Gson();
                String jsonBody = gson.toJson(user);

                return jsonBody.getBytes(StandardCharsets.UTF_8);
            }
        };

        queue.add(stringRequest);
    }


    public boolean validateFirstName() {
        String firstName = first_name.getText().toString();

        if (firstName.isEmpty()) {
            first_name.setError("First name cannot be empty");
            return false;
        } else {
            first_name.setError(null);
            return true;
        }
    }

    public boolean validateLastName() {
        String lastName = last_name.getText().toString();

        if (lastName.isEmpty()) {
            last_name.setError("Last name cannot be empty");
            return false;
        } else {
            last_name.setError(null);
            return true;
        }
    }

    public boolean validateEmail() {
        String e_mail = email.getText().toString();

        if (e_mail.isEmpty()) {
            email.setError("Email name cannot be empty");
            return false;
        } else if (!StringHelper.registerEmailValidationPattern(e_mail)) {
            email.setError("Please enter a valid email");
            return false;
        }else {
            email.setError(null);
            return true;
        }
    }

    public boolean validatePasswordAndConfirm() {
        String password_p = password.getText().toString();
        String confirm_c = confirm.getText().toString();

        if (password_p.isEmpty()) {
            password.setError("Password cannot be empty");
            return false;
        } else if (!password_p.equals(confirm_c)) {
            confirm.setError("Password do not match");
            return false;
        } else if (confirm_c.isEmpty()) {
            confirm.setError("Confirm field cannot be empty");
            return false;
        }else {
            password.setError(null);
            confirm.setError(null);
            return true;
        }
    }


}