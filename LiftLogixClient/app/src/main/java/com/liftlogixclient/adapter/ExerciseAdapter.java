package com.liftlogixclient.adapter;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.resource.bitmap.DownsampleStrategy;
import com.bumptech.glide.request.RequestOptions;
import com.liftlogixclient.ExerciseDetailsActivity;
import com.liftlogixclient.R;
import com.liftlogixclient.models.Exercise;

import java.util.List;

public class ExerciseAdapter extends RecyclerView.Adapter<ExerciseHolder> {
    private List<Exercise> exerciseList;

    public ExerciseAdapter(List<Exercise> exerciseList) {
        this.exerciseList = exerciseList;
    }

    @NonNull
    @Override
    public ExerciseHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_exercise_item, parent, false);
        return new ExerciseHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ExerciseHolder holder, int position) {
        Exercise exercise = exerciseList.get(position);
        holder.textViewName.setText(exercise.getName());

        String base64Image = exercise.getImage();
        if (base64Image != null && base64Image.startsWith("data:image")) {
            // Usuń prefix "data:image/png;base64," lub "data:image/jpeg;base64,"
            String cleanBase64 = base64Image.substring(base64Image.indexOf(",") + 1);

            byte[] decodedString = Base64.decode(cleanBase64, Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

            holder.imageView.setImageBitmap(decodedByte);
        } else {
            holder.imageView.setImageResource(R.mipmap.placeholder);
        }

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), ExerciseDetailsActivity.class);
            intent.putExtra("name", exercise.getName());
            intent.putExtra("description", exercise.getDescription());
            intent.putExtra("videoUrl", exercise.getUrl());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return exerciseList.size();
    }
}

