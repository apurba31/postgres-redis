package com.redis.postgres.model;

import java.io.Serializable;

public class ProductReview implements Serializable {

	private static final long serialVersionUID = 1L;

	private String reviewerName;
	private int rating;
	private String comment;

	public ProductReview() {
	}

	public ProductReview(String reviewerName, int rating, String comment) {
		this.reviewerName = reviewerName;
		this.rating = rating;
		this.comment = comment;
	}

	public String getReviewerName() {
		return reviewerName;
	}

	public void setReviewerName(String reviewerName) {
		this.reviewerName = reviewerName;
	}

	public int getRating() {
		return rating;
	}

	public void setRating(int rating) {
		this.rating = rating;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}
}
