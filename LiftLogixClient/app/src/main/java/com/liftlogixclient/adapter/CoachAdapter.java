package com.liftlogixclient.adapter;

import android.content.Context;
import android.content.Intent;
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
import com.liftlogixclient.RatingActivity;
import com.liftlogixclient.SendApplicationActivity;
import com.liftlogixclient.models.Application;
import com.liftlogixclient.models.Coach;
import com.liftlogixclient.retrofit.CoachApi;
import com.liftlogixclient.retrofit.RetrofitService;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CoachAdapter extends RecyclerView.Adapter<CoachHolder> {
    private final List<Coach> coachList;
    private final List<Application> applicationList;
    private final Map<Long, Double> coachRatingsMap;
    private final long user_id, assignedCoachId;
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
        for (Application application : applicationList) {
            if (application.getCoach().getId() == coach.getId() && "PENDING".equals(application.getStatus())) {
                isPendingApplication = true;
                break;
            }
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

        holder.seeMoreButton.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, RatingActivity.class);
            intent.putExtra("coachId", coach.getId());
            context.startActivity(intent);
        });

        holder.signUpButton.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, SendApplicationActivity.class);
            intent.putExtra("coachId", coach.getId());
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return coachList.size();
    }
}
