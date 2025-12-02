"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  Ruler,
  Shirt,
  Droplets,
  Leaf,
  Package,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";

interface ProductTabsProps {
  product: Product;
}

type FitRating = "too_small" | "true_to_size" | "too_large";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  fit: FitRating;
  verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductFeatures {
  fit?: string;
  rise?: string;
  leg_style?: string;
  closure?: string;
  stretch_level?: string;
  material?: string;
  material_composition?: Record<string, number>;
  care_instructions?: string[];
  sustainability?: string;
  country_of_origin?: string;
  front_rise?: string;
  knee_measurement?: string;
  leg_opening?: string;
  inseam?: string;
  model_height?: string;
  model_waist?: string;
  model_size_worn?: string;
  style_notes?: string;
}

/**
 * Product Tabs - Levi's Inspired
 * Features real product details from database, composition & care, and reviews
 */
export function ProductTabs({ product }: ProductTabsProps) {
  const { state } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dbFeatures, setDbFeatures] = useState<ProductFeatures | null>(null);
  const [newReview, setNewReview] = useState<{
    rating: number;
    title: string;
    content: string;
    fit: FitRating;
  }>({
    rating: 5,
    title: "",
    content: "",
    fit: "true_to_size",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch product features from database
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch(`/api/products/${product.id}/features`);
        if (response.ok) {
          const data = await response.json();
          setDbFeatures(data.features);
        }
      } catch (error) {
        console.error("Failed to fetch product features:", error);
      }
    }
    fetchFeatures();
  }, [product.id]);

  // Get product features - from database if available, otherwise fallback
  const getProductFeatures = () => {
    const features = [];

    // If we have database features, use them
    if (dbFeatures) {
      if (dbFeatures.fit) {
        features.push({
          icon: Shirt,
          label: "Fit",
          value: dbFeatures.fit,
        });
      }
      if (dbFeatures.material) {
        features.push({
          icon: Droplets,
          label: "Material",
          value: dbFeatures.material,
        });
      }
      if (dbFeatures.stretch_level) {
        features.push({
          icon: Ruler,
          label: "Stretch",
          value: dbFeatures.stretch_level,
        });
      }
      if (dbFeatures.sustainability) {
        features.push({
          icon: Leaf,
          label: "Sustainability",
          value: dbFeatures.sustainability,
        });
      }

      // Return if we have features from DB
      if (features.length > 0) return features;
    }

    // Fallback: Generate features based on description/name
    const desc = product.description?.toLowerCase() || "";
    const name = product.name.toLowerCase();

    // Fit features
    if (desc.includes("slim") || name.includes("slim")) {
      features.push({
        icon: Shirt,
        label: "Fit",
        value: "Slim fit through the seat and thigh",
      });
    } else if (desc.includes("relaxed") || name.includes("relaxed")) {
      features.push({
        icon: Shirt,
        label: "Fit",
        value: "Relaxed fit through the seat and thigh",
      });
    } else if (desc.includes("regular") || name.includes("regular")) {
      features.push({
        icon: Shirt,
        label: "Fit",
        value: "Regular fit through the seat and thigh",
      });
    } else {
      features.push({ icon: Shirt, label: "Fit", value: "Classic fit" });
    }

    // Material features
    if (desc.includes("cotton")) {
      features.push({
        icon: Droplets,
        label: "Material",
        value: "100% Premium Cotton",
      });
    } else if (desc.includes("denim")) {
      features.push({
        icon: Droplets,
        label: "Material",
        value: "Premium Denim",
      });
    } else if (desc.includes("linen")) {
      features.push({
        icon: Droplets,
        label: "Material",
        value: "Breathable Linen Blend",
      });
    } else {
      features.push({
        icon: Droplets,
        label: "Material",
        value: "Premium Quality Fabric",
      });
    }

    // Stretch feature
    if (desc.includes("stretch")) {
      features.push({
        icon: Ruler,
        label: "Stretch",
        value: "Added stretch for comfort",
      });
    } else {
      features.push({
        icon: Ruler,
        label: "Stretch",
        value: "Non-stretch classic denim",
      });
    }

    // Sustainability
    features.push({
      icon: Leaf,
      label: "Sustainability",
      value: "Made with sustainable practices",
    });

    return features;
  };

  const productFeatures = getProductFeatures();

  // Care instructions - from database if available
  const getCareInstructions = () => {
    if (
      dbFeatures?.care_instructions &&
      dbFeatures.care_instructions.length > 0
    ) {
      return dbFeatures.care_instructions;
    }
    // Default care instructions
    return [
      "Machine wash cold with like colors",
      "Do not bleach",
      "Tumble dry low",
      "Warm iron if needed",
      "Wash inside out to preserve color",
      "Wash your jeans once every 10 wears to increase lifespan",
    ];
  };

  // Measurements - from database if available
  const getMeasurements = () => {
    if (dbFeatures) {
      return {
        front_rise: dbFeatures.front_rise || '11 1/4"',
        knee: dbFeatures.knee_measurement || '17 1/2"',
        leg_opening: dbFeatures.leg_opening || '16"',
        note: `Measurements based on size ${
          dbFeatures.model_size_worn || "32"
        }`,
      };
    }
    // Default measurements
    return {
      front_rise: '11 1/4"',
      knee: '17 1/2"',
      leg_opening: '16"',
      note: "Measurements based on size 32",
    };
  };

  const handleSubmitReview = async () => {
    if (!state.user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!newReview.title || !newReview.content) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
          fit_rating: newReview.fit,
        }),
      });

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReview({
          rating: 5,
          title: "",
          content: "",
          fit: "true_to_size",
        });
        // Reload reviews
        loadReviews();
      } else {
        toast.error("Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?product_id=${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const careInstructions = getCareInstructions();
  const measurements = getMeasurements();

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full max-w-2xl grid grid-cols-3 bg-gray-100 p-1 rounded-none">
        <TabsTrigger
          value="details"
          className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-sm font-medium"
        >
          Details
        </TabsTrigger>
        <TabsTrigger
          value="care"
          className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-sm font-medium"
        >
          Composition & Care
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-sm font-medium"
          onClick={() => loadReviews()}
        >
          Reviews
        </TabsTrigger>
      </TabsList>

      {/* Details Tab */}
      <TabsContent value="details" className="mt-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* About This Style */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              ABOUT THIS STYLE
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description ||
                "A timeless piece crafted with attention to detail. Designed for comfort and durability, this item represents the perfect blend of classic style and modern functionality."}
            </p>

            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                Classic, timeless design
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                Premium quality materials
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                Expertly crafted construction
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                Versatile for any occasion
              </li>
            </ul>
          </div>

          {/* How it Fits */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              HOW IT FITS
            </h3>
            <div className="space-y-4">
              {productFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-black">{feature.label}</p>
                    <p className="text-sm text-gray-500">{feature.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Measurements */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-3 text-black">
                MEASUREMENTS
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Front Rise</p>
                  <p className="font-medium">{measurements.front_rise}</p>
                </div>
                <div>
                  <p className="text-gray-500">Knee</p>
                  <p className="font-medium">{measurements.knee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Leg Opening</p>
                  <p className="font-medium">{measurements.leg_opening}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{measurements.note}</p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Composition & Care Tab */}
      <TabsContent value="care" className="mt-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Composition */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              COMPOSITION
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Material</span>
                <span className="font-medium">
                  {productFeatures.find((f) => f.label === "Material")?.value ||
                    "Premium Fabric"}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Stretch</span>
                <span className="font-medium">
                  {productFeatures
                    .find((f) => f.label === "Stretch")
                    ?.value.includes("Non")
                    ? "No"
                    : "Yes"}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Style</span>
                <span className="font-medium">5-pocket styling</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">SKU</span>
                <span className="font-medium uppercase">{product.slug}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">
                  {product.categories?.name || "Apparel"}
                </span>
              </div>
            </div>
          </div>

          {/* Care Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              CARE INSTRUCTIONS
            </h3>
            <ul className="space-y-3">
              {careInstructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-600"
                >
                  <Package className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>

            {/* Sustainability Note */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Sustainability Commitment
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    This product is made with sustainable practices and
                    eco-friendly materials where possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews" className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-black">
              CUSTOMER REVIEWS
            </h3>
            <p className="text-sm text-gray-500">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Write a Review
          </Button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <Card className="p-6 mb-8 border border-gray-200">
            <h4 className="font-semibold mb-4">Write Your Review</h4>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Fit */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                How does it fit?
              </label>
              <div className="flex gap-2">
                {[
                  { value: "too_small", label: "Runs Small" },
                  { value: "true_to_size", label: "True to Size" },
                  { value: "too_large", label: "Runs Large" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNewReview({
                        ...newReview,
                        fit: option.value as FitRating,
                      })
                    }
                    className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                      newReview.fit === option.value
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                placeholder="Sum up your review in a headline"
              />
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <Textarea
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                className="w-full min-h-[120px] border-gray-300 focus:border-black"
                placeholder="Tell us what you think about this product..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                className="bg-black text-white hover:bg-gray-800"
              >
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold">{review.title}</h4>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{review.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="capitalize">
                    {review.fit.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span>{review.user_name}</span>
                  <button className="flex items-center gap-1 hover:text-black">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful_count})
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No reviews yet</h4>
            <p className="text-gray-500 mb-4">
              Be the first to review this product!
            </p>
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              Write a Review
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
