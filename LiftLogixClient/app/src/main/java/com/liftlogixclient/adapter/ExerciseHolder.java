package com.liftlogixclient.adapter;

import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.R;

public class ExerciseHolder extends RecyclerView.ViewHolder {
    ImageView imageView;
    TextView textViewName;

    public ExerciseHolder(View itemView) {
        super(itemView);
        imageView = itemView.findViewById(R.id.imageView);
        textViewName = itemView.findViewById(R.id.textViewName);
    }
}

