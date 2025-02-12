package com.liftlogixclient.adapter;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.LoginActivity;
import com.liftlogixclient.R;
import com.liftlogixclient.RatingActivity;
import com.liftlogixclient.SendApplicationActivity;
import com.liftlogixclient.models.Application;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.CoachApi;
import com.liftlogixclient.retrofit.RetrofitService;
import com.liftlogixclient.retrofit.UserApi;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CoachAdapter extends RecyclerView.Adapter<CoachHolder> {
    private final List<Coach> coachList;
    private final List<Application> applicationList;
    private final Map<Long, Double> coachRatingsMap;
    private final long user_id;
    private long assignedCoachId;
    private final String token;

    public CoachAdapter(List<Coach> coachList, List<Application> applicationList,
                        Map<Long, Double> coachRatingsMap, long user_id, long assignedCoachId,
                        String token) {
        this.applicationList = applicationList;
        this.coachList = coachList;
        this.coachRatingsMap = coachRatingsMap;
        this.user_id = user_id;
        this.assignedCoachId = assignedCoachId;
        this.token = token;
    }

    @NonNull
    @Override
    public CoachHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_coach_item, parent, false);
        return new CoachHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CoachHolder holder, int position) {
        Coach coach = coachList.get(position);
        holder.first_name.setText(coach.getFirst_name());
        holder.last_name.setText(coach.getLast_name());
        holder.description.setText(coach.getDescription());

        boolean isPendingApplication = false;
        boolean isAssignedCoach = false;
        for (Application application : applicationList) {
            if (application.getCoach().getId() == coach.getId() && "PENDING".equals(application.getStatus())) {
                isPendingApplication = true;
                break;
            }
        }

        if (assignedCoachId == coach.getId() && assignedCoachId != -1 && assignedCoachId != 0) {
            isPendingApplication = true;
            isAssignedCoach = true;
        }

        Double coachRating = coachRatingsMap.get(coach.getId());
        if (coachRating != null) {
            holder.ratingBar.setRating(coachRating.floatValue());
        } else {
            holder.ratingBar.setRating(0f);
        }

        if (isPendingApplication) {
            holder.signUpButton.setVisibility(View.GONE);
        } else {
            holder.signUpButton.setVisibility(View.VISIBLE);
        }

        if (isAssignedCoach) {
            holder.signOffButton.setVisibility(View.VISIBLE);
            holder.signUpButton.setVisibility(View.GONE);
        } else {
            if (assignedCoachId != 0 && assignedCoachId != -1) {
                holder.signUpButton.setVisibility(View.GONE);
            }
            holder.signOffButton.setVisibility(View.GONE);
        }

        holder.signOffButton.setOnClickListener(v -> {
            Context context = v.getContext();
            showConfirmationDialog(context, user_id);
        });

        holder.seeMoreButton.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, RatingActivity.class);
            intent.putExtra("clientId", user_id);
            intent.putExtra("coachId", coach.getId());
            context.startActivity(intent);
        });

        holder.signUpButton.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, SendApplicationActivity.class);
            intent.putExtra("clientId", user_id);
            intent.putExtra("coachId", coach.getId());
            context.startActivity(intent);
        });

        RetrofitService retrofitService = new RetrofitService();
        UserApi userApi = retrofitService.getRetrofit().create(UserApi.class);
        userApi.getUserImage("Bearer " + token, coach.getId()).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful() && response.body() != null) {
                    InputStream inputStream = response.body().byteStream();
                    Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                    holder.profileImage.setImageBitmap(bitmap);
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable throwable) {
                holder.profileImage.setImageResource(R.mipmap.default_profile);
            }
        });
    }

    @Override
    public int getItemCount() {
        return coachList.size();
    }

    private void showConfirmationDialog(Context context, long clientId) {
        new AlertDialog.Builder(context)
                .setTitle("Potwierdzenie")
                .setMessage("Czy na pewno chcesz się wypisać od tego trenera?")
                .setPositiveButton("Tak", (dialog, which) -> unsubscribeUser(context, clientId))
                .setNegativeButton("Nie", null)
                .show();
    }

    private void unsubscribeUser(Context context, long clientId) {
        String token = "Bearer " + this.token;

        RetrofitService retrofitService = new RetrofitService();
        UserApi userApi = retrofitService.getRetrofit().create(UserApi.class);

        Call<Void> call = userApi.unsubscribeUserFromCoach(clientId, token);

        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(context, "Wypisano pomyślnie!", Toast.LENGTH_SHORT).show();
                    assignedCoachId = 0;
                    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
                    SharedPreferences.Editor editor = preferences.edit();
                    editor.putBoolean("isAssigned", false);
                    editor.remove("coach_id");
                    editor.apply();
                } else if (response.code() == 409) {
                    Toast.makeText(context, "Nie jesteś zapisany do tego trenera!", Toast.LENGTH_LONG).show();
                } else if (response.code() == 403) {
                    Toast.makeText(context, "Brak uprawnień!", Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(context, "Wystąpił błąd. Spróbuj ponownie.", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(context, "Błąd sieci: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
