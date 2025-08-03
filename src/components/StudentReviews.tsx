import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Heart,
  Flag,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  userId: string;
  userFirstName: string;
  cityCountry: string;
  rating: number;
  studyPeriod: string;
  university: string;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  replies?: ReviewReply[];
}

interface ReviewReply {
  id: string;
  userId: string;
  userFirstName: string;
  content: string;
  createdAt: string;
}

interface StudentReviewsProps {
  destinationId: string;
  city: string;
  country: string;
}

export default function StudentReviews({
  destinationId,
  city,
  country,
}: StudentReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest" | "helpful"
  >("newest");

  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
    pros: "",
    cons: "",
    wouldRecommend: true,
    studyPeriod: "",
    university: "",
  });

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [destinationId, sortBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/destinations/${destinationId}/reviews?sort=${sortBy}`,
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!session) {
      alert("Please sign in to write a review");
      return;
    }

    try {
      const response = await fetch(
        `/api/destinations/${destinationId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newReview,
            pros: newReview.pros
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p),
            cons: newReview.cons
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c),
          }),
        },
      );

      if (response.ok) {
        setNewReview({
          rating: 5,
          title: "",
          content: "",
          pros: "",
          cons: "",
          wouldRecommend: true,
          studyPeriod: "",
          university: "",
        });
        setShowWriteReview(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const voteOnReview = async (reviewId: string, isHelpful: boolean) => {
    if (!session) return;

    try {
      await fetch(
        `/api/destinations/${destinationId}/reviews/${reviewId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHelpful }),
        },
      );
      fetchReviews();
    } catch (error) {
      console.error("Error voting on review:", error);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!session || !replyContent.trim()) return;

    try {
      await fetch(
        `/api/destinations/${destinationId}/reviews/${reviewId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: replyContent }),
        },
      );
      setReplyContent("");
      setReplyingTo(null);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const recommendationRate =
    reviews.length > 0
      ? Math.round(
          (reviews.filter((r) => r.wouldRecommend).length / reviews.length) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {recommendationRate}%
              </div>
              <p className="text-sm text-gray-600">Would Recommend</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reviews.length}
              </div>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            Reviews for {city}, {country}
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {session && (
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Write Review
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <Card>
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Study Period
                </label>
                <Input
                  placeholder="e.g., Fall 2023, Spring 2024"
                  value={newReview.studyPeriod}
                  onChange={(e) =>
                    setNewReview({ ...newReview, studyPeriod: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  University
                </label>
                <Input
                  placeholder="Which university did you attend?"
                  value={newReview.university}
                  onChange={(e) =>
                    setNewReview({ ...newReview, university: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Overall Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newReview.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Review Title
              </label>
              <Input
                placeholder="Summarize your experience in a few words"
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Detailed Review
              </label>
              <Textarea
                placeholder="Share your detailed experience, including accommodation, costs, student life, etc."
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pros (comma-separated)
                </label>
                <Textarea
                  placeholder="Great location, affordable housing, friendly people"
                  value={newReview.pros}
                  onChange={(e) =>
                    setNewReview({ ...newReview, pros: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cons (comma-separated)
                </label>
                <Textarea
                  placeholder="Language barrier, expensive food, limited nightlife"
                  value={newReview.cons}
                  onChange={(e) =>
                    setNewReview({ ...newReview, cons: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommend"
                checked={newReview.wouldRecommend}
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    wouldRecommend: e.target.checked,
                  })
                }
                className="rounded"
              />
              <label htmlFor="recommend" className="text-sm">
                I would recommend this destination to future students
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={submitReview}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWriteReview(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to share your experience in {city}, {country}!
              </p>
              {session && (
                <Button onClick={() => setShowWriteReview(true)}>
                  Write the First Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.userFirstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {review.userFirstName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {review.studyPeriod}
                          </Badge>
                          {review.wouldRecommend && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              ✓ Recommends
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      {review.title}
                    </h4>
                    <p className="text-gray-700 mb-3">{review.content}</p>

                    {review.university && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>University:</strong> {review.university}
                      </p>
                    )}

                    {/* Pros and Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">
                              👍 Pros
                            </h5>
                            <ul className="space-y-1">
                              {review.pros.map((pro, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-700"
                                >
                                  • {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">
                              👎 Cons
                            </h5>
                            <ul className="space-y-1">
                              {review.cons.map((con, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-700"
                                >
                                  • {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <button
                      onClick={() => voteOnReview(review.id, true)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpfulVotes})
                    </button>
                    <button
                      onClick={() => voteOnReview(review.id, false)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Not Helpful ({review.unhelpfulVotes})
                    </button>
                    {session && (
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === review.id ? null : review.id,
                          )
                        }
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reply
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => submitReply(review.id)}
                          disabled={!replyContent.trim()}
                        >
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {reply.userFirstName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {reply.userFirstName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
