package com.liftlogixclient.adapter;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.LoginActivity;
import com.liftlogixclient.R;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.CoachApi;
import com.liftlogixclient.retrofit.RetrofitService;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.List;

public class CoachAdapter extends RecyclerView.Adapter<CoachHolder> {
    private List<Coach> coachList;
    private long user_id, assignedCoachId;
    private boolean isAssigned;

    public CoachAdapter(List<Coach> coachList, long user_id, boolean isAssigned, long assignedCoachId) {
        this.coachList = coachList;
        this.user_id = user_id;
        this.isAssigned = isAssigned;
        this.assignedCoachId = assignedCoachId;
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

        if (isAssigned) {
            if (coach.getId() == assignedCoachId) {
                holder.signUpButton.setVisibility(View.GONE);
                holder.unsubscribeButton.setVisibility(View.VISIBLE);
            } else {
                holder.signUpButton.setVisibility(View.GONE);
                holder.unsubscribeButton.setVisibility(View.GONE);
            }
        } else {
            holder.signUpButton.setVisibility(View.VISIBLE);
            holder.unsubscribeButton.setVisibility(View.GONE);
        }

        holder.signUpButton.setOnClickListener(v -> signUpToCoach(holder.itemView.getContext(), coach.getId()));
        holder.unsubscribeButton.setOnClickListener(v -> unsubscribeFromCoach(holder.itemView.getContext()));
    }

    @Override
    public int getItemCount() {
        return coachList.size();
    }

    private void signUpToCoach(Context context, long coachId) {
        RetrofitService retrofitService = new RetrofitService();
        CoachApi coachApi = retrofitService.getRetrofit().create(CoachApi.class);
        coachApi.assignUserToCoach(user_id, coachId).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    isAssigned = true;
                    assignedCoachId = coachId;

                    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
                    SharedPreferences.Editor editor = preferences.edit();
                    editor.putBoolean("isAssigned", isAssigned);
                    editor.putLong("coach_id", assignedCoachId);
                    editor.apply();

                    notifyDataSetChanged();
                    Toast.makeText(context, "You have been successfully signed up", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(context, "An error occurred during registration", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(context, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void unsubscribeFromCoach(Context context) {
        RetrofitService retrofitService = new RetrofitService();
        CoachApi coachApi = retrofitService.getRetrofit().create(CoachApi.class);
        coachApi.unsubscribeFromCoach(user_id).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    isAssigned = false;
                    assignedCoachId = -1;

                    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
                    SharedPreferences.Editor editor = preferences.edit();
                    editor.putBoolean("isAssigned", isAssigned);
                    editor.putLong("coach_id", assignedCoachId);
                    editor.apply();

                    notifyDataSetChanged();
                    Toast.makeText(context, "Unsubscribe completed successfully", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(context, "An error occurred while writing", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(context, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
