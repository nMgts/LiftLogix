package com.liftlogixclient.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.liftlogixclient.R;
import com.liftlogixclient.models.Opinion;

import java.util.List;

public class OpinionAdapter extends RecyclerView.Adapter<OpinionAdapter.OpinionViewHolder> {
    private List<Opinion> opinions;
    private boolean historyExists;

    public OpinionAdapter(List<Opinion> opinions) {
        this.opinions = opinions;
    }

    @Override
    public OpinionViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_opinion, parent, false);
        return new OpinionViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(OpinionViewHolder holder, int position) {
        Opinion opinion = opinions.get(position);
        holder.bind(opinion);
    }

    @Override
    public int getItemCount() {
        return opinions != null ? opinions.size() : 0;
    }

    public void setHistoryExists(boolean historyExists) {
        this.historyExists = historyExists;
        notifyDataSetChanged();
    }

    public static class OpinionViewHolder extends RecyclerView.ViewHolder {
        private TextView opinionDescription;
        private TextView opinionRating;

        public OpinionViewHolder(View itemView) {
            super(itemView);
            opinionDescription = itemView.findViewById(R.id.opinionDescription);
            opinionRating = itemView.findViewById(R.id.opinionRating);
        }

        public void bind(Opinion opinion) {
            opinionDescription.setText(opinion.getDescription());
            opinionRating.setText(String.valueOf(opinion.getRating()));
        }
    }
}
