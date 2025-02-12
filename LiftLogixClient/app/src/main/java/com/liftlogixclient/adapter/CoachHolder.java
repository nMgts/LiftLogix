package com.liftlogixclient.adapter;

import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.R;

public class CoachHolder extends RecyclerView.ViewHolder {

    TextView first_name, last_name, description;
    RatingBar ratingBar;
    ImageButton seeMoreButton;
    Button signUpButton, signOffButton;
    ImageView profileImage;

    public CoachHolder(@NonNull View itemView) {
        super(itemView);
        first_name = itemView.findViewById(R.id.coachListItem_firstName);
        last_name = itemView.findViewById(R.id.coachListItem_lastName);
        description = itemView.findViewById(R.id.coachListItem_description);
        profileImage = itemView.findViewById(R.id.coachListItem_image);

        ratingBar = itemView.findViewById(R.id.coachListItem_rating);
        seeMoreButton = itemView.findViewById(R.id.seeMoreButton);
        signUpButton = itemView.findViewById(R.id.signUpButton);
        signOffButton = itemView.findViewById(R.id.signOffButton);
    }
}
