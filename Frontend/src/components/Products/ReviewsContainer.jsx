import React, { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { postReview, deleteReview } from "../../store/slices/productSlice";

const ReviewsContainer = ({ product, productReviews }) => {
  const { authUser } = useSelector((state) => state.auth);
  const { isReviewDeleting, isPostingReview } = useSelector((state) => state.product);

  const dispatch = useDispatch();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    dispatch(
      postReview({
        productId: product.id || product._id,
        review: { rating, comment },
      })
    );
    setComment("");
    setRating(5);
  };

  const handleDelete = (reviewId) => {
    dispatch(
      deleteReview({
        productId: product.id || product._id,
        reviewId,
      })
    );
  };

  const reviewsList = productReviews || product?.reviews || [];

  return (
    <div className="space-y-8">
      {authUser ? (
        <form onSubmit={handleReviewSubmit} className="glass-card p-6 space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Leave a Review</h4>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Write your review here..."
              required
              className="w-full p-3 rounded-xl border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isPostingReview || !comment.trim()}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:glow-on-hover transition-all disabled:opacity-50"
          >
            {isPostingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="glass-card p-4 text-center text-muted-foreground">
          <p>Please log in to leave a review.</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Customer Reviews ({reviewsList.length})
        </h3>
        {reviewsList.length > 0 ? (
          <div className="space-y-4">
            {reviewsList.map((review) => {
              const reviewRating = Number(review.rating) || 0;
              const isOwner =
                authUser &&
                (String(authUser.id) === String(review.reviewer?.id) ||
                  String(authUser.id) === String(review.user_id));

              return (
                <div key={review.review_id || review.id} className="glass-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 mb-3">
                      <img
                        src={review.reviewer?.avatar?.url || "/avatar-holder.avif"}
                        alt={review.reviewer?.name || "Reviewer"}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {review.reviewer?.name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center space-x-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < reviewRating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(review.review_id || review.id)}
                        disabled={isReviewDeleting}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsContainer;
