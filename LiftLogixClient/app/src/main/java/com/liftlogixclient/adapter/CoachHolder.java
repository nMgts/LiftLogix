package com.liftlogixclient.adapter;

import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.R;

public class CoachHolder extends RecyclerView.ViewHolder {

    TextView first_name, last_name, description;
    Button signUpButton, unsubscribeButton;

    public CoachHolder(@NonNull View itemView) {
        super(itemView);
        first_name = itemView.findViewById(R.id.coachListItem_firstName);
        last_name = itemView.findViewById(R.id.coachListItem_lastName);
        description = itemView.findViewById(R.id.coachListItem_description);

        signUpButton = itemView.findViewById(R.id.signUpButton);
        unsubscribeButton = itemView.findViewById(R.id.unsubscribeButton);
    }
}
