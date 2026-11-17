import React, { FC, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import RatingSelector from "./RatingSelector";
import {
  NAVIGATION_IMAGE,
  ADD_REVIEW_IMG,
} from "@config/Header/image.config";
import Modal from "@components/dialogDrawer/modal/Modal";
import Icon from "@components/image/Icons";
import TextAreaField from "@components/textarea/TextAreaField";
import PrimaryButton from "@components/buttons/PrimaryButton";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";
import { getProductParameter, getReview, getStoreParameter, getStoreReviewUser } from "@services/reviewRatingService";
import { ReviewPayload, Order, OrderItem } from "@components/type/order.type";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { useSubmitReview } from "@hooks/useSubmitReview";
import Loader from "@components/loader/Loader";
import { useDebouncedApiCall } from "@hooks/useDebouncedApiCall";
import { MediaType } from "@components/type/pdp.type";
import UppyMediaUpload from "@components/uppy/UppyMediaUpload";
import { useToast } from "@components/toast/Toast";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import { getTenantConfig } from "@config/tenant.config";

const FilePreview = dynamic(() => import("@components/uppy/FilePreview"));

interface RatingParameter {
  parameterId: string;
  parameterName: string;
  description: string;
  appliedTo: 'product' | 'category';
  entity: Array<{
    id: string;
    name: string;
  }>;
  mandatory: boolean;
}

interface StoreParameterResponse {
  data: Array<{
    id: string;
    name: string;
    is_required: boolean;
  }>;
}

interface StoreReviewPayload {
  storeid: string;
  user_firstname: string;
  user_lastname: string;
  title: string;
  content: string;
  source_channel: string;
  order_id: string;
  store_rating: Array<{
    parameter_id: string;
    rating: number;
  }>;
}

interface ProductParameterResponse {
  data: {
    rattingParameter: RatingParameter[];
  };
}

interface ExistingReview {
  reviewId: string;
  productId: string;
  content: string;
  media: MediaType[];
  parameter_review: Array<{
    parameter_id: string;
    parameter_name: string;
    rating: number;
    product_id: string;
  }>;
}

interface StoreReviewUserResponse {
  data: Array<{
    ratings: Array<{
      id: string;
      parameter_name: string;
      rating: number;
    }>;
    content?: string;
  }>;
}

interface Review {
  reviewId: string;
  productId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  title: string;
  content: string;
  sourceChannel: string;
  orderId: string;
  createdAt: number;
  status: string;
  rating: number;
  likes: number;
  dislikes: number;
  media: MediaType[];
  parameter_review: Array<{
    product_id: string;
    parameter_id: string;
    parameter_name: string;
    rating: number;
    review_id: number;
  }>;
}

// Define proper types for uploaded files
interface UploadedFile {
  id: string;
  data: File;
  uploadURL?: string;
  type?: string;
}

type ReviewModalProps = {
  isReviewModalOpen: boolean;
  onReviewModalClose: () => void;
  currentOrderDetails: Order;
};

const ReviewModal: FC<ReviewModalProps> = ({
  isReviewModalOpen,
  onReviewModalClose,
  currentOrderDetails,
}) => {
  const { submitReview } = useSubmitReview();
  const toast = useToast();
  const [restaurantRatings, setRestaurantRatings] = useState<{ [key: string]: number }>({});
  const [storeParameter, setStoreParameter] = useState<StoreParameterResponse | null>(null);
  const [restaurantReview, setRestaurantReview] = useState("");
  const [storeReviewUser, setStoreReviewUser] = useState<StoreReviewUserResponse | null>(null);
  const tenantConfig  = getTenantConfig();

  // Parameter-specific file upload state with proper typing
  const [parameterFiles, setParameterFiles] = useState<{ [productId: string]: { [parameterId: string]: UploadedFile[] } }>({});
  const [activeUppyDialog, setActiveUppyDialog] = useState<{ productId: string; parameterId: string } | null>(null);

  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const rateRestaurantTitle =
    tenantConfig.rateRestaurantTitle || lang.RateRestaurant;
  const rateFoodTitle = tenantConfig.rateFoodTitle || lang.RateFood;

  const [productRatings, setProductRatings] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [productParameter, setProductParameter] = useState<ProductParameterResponse | null>(null);
  const [productReviews, setProductReviews] = useState<{ [key: string]: string }>({});
  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get parameters for product - moved before useCallback to fix dependency
  const getParametersForProduct = useCallback((item: {
    productId: string;
    productName: {
      en: string;
    };
    productCategory: {
      en: string;
    };
  }) => {
    if (!productParameter?.data?.rattingParameter) return [];

    return productParameter.data.rattingParameter.filter((parameter: RatingParameter) => {
      if (parameter.appliedTo.toLowerCase() === "product") {
        return parameter.entity.some((entity) => entity.name === item?.productName?.en);
      } else if (parameter.appliedTo.toLowerCase() === "category") {
        return parameter.entity.some((entity) => entity.name === item?.productCategory?.en);
      }
      return false;
    });
  }, [productParameter?.data?.rattingParameter]);

  // Add validation for required ratings
  const hasRequiredStoreRatings = useCallback(() => {
    if (!storeParameter?.data) return false;
    const requiredParams = storeParameter.data.filter(param => param.is_required);
    const isValid = requiredParams.every(param => {
      const rating = restaurantRatings[param.id];
      return rating !== undefined && rating > 0;
    });
    return isValid;
  }, [storeParameter?.data, restaurantRatings]);

  const hasRequiredProductRatings = useCallback(() => {
    if (!productParameter?.data?.rattingParameter) return false;
    const isValid = currentOrderDetails?.items?.every(item => {
      const parameters = getParametersForProduct(item);
      return parameters.every(param => {
        const hasRating = !param.mandatory || productRatings[item.productId]?.[param.parameterId] !== undefined;
        return hasRating;
      });
    });
    return isValid;
  }, [productParameter?.data?.rattingParameter, productRatings, currentOrderDetails?.items, getParametersForProduct]);

  // Add validation for required review texts
  const hasRequiredStoreReview = useCallback(() => {
    const storeRatings = storeReviewUser?.data?.[0]?.ratings;
    const alreadyRated = storeRatings && storeRatings.length > 0;
    if (alreadyRated) return true; // If already rated, review is not required
    return restaurantReview.trim().length > 0;
  }, [storeReviewUser, restaurantReview]);

  const hasRequiredProductReviews = useCallback(() => {
    if (!currentOrderDetails?.items) return false;
    const isValid = currentOrderDetails.items.every(item => {
      const existingReview = existingReviews.find(review => review.productId === item.productId);
      // If product already has a review, it's valid
      if (existingReview) return true;
      // Otherwise, check if review text exists and is not empty
      const reviewText = productReviews[item.productId] || "";
      return reviewText.trim().length > 0;
    });
    return isValid;
  }, [currentOrderDetails?.items, existingReviews, productReviews]);

  // Create debounced versions of the API calls
  const debouncedGetStoreReviewUser = useDebouncedApiCall(getStoreReviewUser);
  const debouncedGetStoreParameter = useDebouncedApiCall(getStoreParameter);
  const debouncedGetReview = useDebouncedApiCall(getReview);
  const debouncedGetProductParameter = useDebouncedApiCall(getProductParameter);

  // Handle restaurant rating change
  const handleRestaurantRatingChange = (parameterName: string, rating: number) => {
    setRestaurantRatings(prev => ({
      ...prev,
      [parameterName]: rating
    }));
  };

  // Handle restaurant review change
  const handleRestaurantReviewChange = (value: string) => {
    setRestaurantReview(value);
  };

  // Handle store review user
  const HandleGetStoreReviewUser = useCallback(async (order_id: string) => {
    setIsLoading(true);
    try {
      const storeReviewUser = await debouncedGetStoreReviewUser(order_id);
      setStoreReviewUser(storeReviewUser);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [debouncedGetStoreReviewUser]);

  // Handle store parameter
  const handleGetStoreParameter = useCallback(async () => {
    setIsLoading(true);
    try {
      const storeParameter = await debouncedGetStoreParameter();
      setStoreParameter(storeParameter);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [debouncedGetStoreParameter]);

  useEffect(() => {
    if (isReviewModalOpen) {
      handleGetStoreParameter();
      HandleGetStoreReviewUser(currentOrderDetails?.orderNumber);
    }
  }, [isReviewModalOpen, currentOrderDetails?.orderNumber, handleGetStoreParameter, HandleGetStoreReviewUser]);

  /////////Product Review//////////////////

  // Handle product rating change
  const handleProductRatingChange = (productId: string, parameterId: string, rating: number) => {
    setProductRatings(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [parameterId]: rating
      }
    }));
  };

  // Handle product review change
  const handleProductReviewChange = (productId: string, value: string) => {
    setProductReviews(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  // Handle Uppy dialog open/close for specific parameter
  const handleOpenUppyDialog = (productId: string, parameterId: string) => {
    setActiveUppyDialog({ productId, parameterId });
  };

  const handleCloseUppyDialog = () => {
    setActiveUppyDialog(null);
  };

  // Handle file upload completion for specific parameter
  const handleUploadComplete = (files: UploadedFile[]) => {
    if (!activeUppyDialog) return;

    const { productId, parameterId } = activeUppyDialog;
    setParameterFiles(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [parameterId]: [
          ...(prev[productId]?.[parameterId] || []),
          ...files
        ]
      }
    }));
    setActiveUppyDialog(null);
  };

  const handleRemoveFile = (productId: string, parameterId: string, fileId: string) => {
    setParameterFiles(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [parameterId]: (prev[productId]?.[parameterId] || []).filter(file => file.id !== fileId)
      }
    }));
  };

  // Submit review
  const onSubmit = async () => {
    setLoading(true);
    try {
      const basePayload = {
        order_id: currentOrderDetails?.orderNumber,
        title: rateFoodTitle,
        source_channel: "website",
        product_rating: Object.entries(productRatings).map(([productId, ratings]): { product_id: string; product_rating: Array<{ parameter_id: string; rating: number }> } => ({
          product_id: productId,
          product_rating: Object.entries(ratings).map(([parameterId, rating]): { parameter_id: string; rating: number } => ({
            parameter_id: parameterId,
            rating: rating
          }))
        }))
      };

      const storePayload: StoreReviewPayload = {
        storeid: currentOrderDetails?.storefrontId || "",
        user_firstname: session?.user?.firstName || "",
        user_lastname: session?.user?.lastName || "",
        title: rateRestaurantTitle,
        content: restaurantReview,
        source_channel: "website",
        order_id: currentOrderDetails?.orderNumber,
        store_rating: Object.entries(restaurantRatings).map(([parameterId, rating]): { parameter_id: string; rating: number } => ({
          parameter_id: parameterId,
          rating: rating
        }))
      };

      // Get all product IDs from the order
      const allProductIds = currentOrderDetails?.items?.map(item => item.productId) || [];

      // Create payloads for all products with separate media files for each parameter
      const payloads = allProductIds.map((productId): ReviewPayload => {
        const ratings = productRatings[productId] || {};
        const content = productReviews[productId] || ""; // Use specific product review content

        // Extract media files for this specific product's parameters
        const productMediaFiles: Array<{ media_type: string; media_url: string }> = [];
        const productParameterFiles = parameterFiles[productId] || {};

        Object.entries(productParameterFiles).forEach(([, files]) => {
          files.forEach((file: UploadedFile) => {
            if (file.uploadURL) {
              // Determine media type based on file type
              const mediaType = file.type?.startsWith('image/') ? 'image' :
                file.type?.startsWith('video/') ? 'video' : 'image';

              productMediaFiles.push({
                media_type: mediaType,
                media_url: file.uploadURL
              });
            }
          });
        });

        return {
          ...basePayload,
          product_id: productId,
          content: content,
          media_files: productMediaFiles,
          product_rating: Object.entries(ratings).map(([parameterId, rating]): { parameter_id: string; rating: number } => ({
            parameter_id: parameterId,
            rating: rating
          }))
        };
      });

      await submitReview(payloads as ReviewPayload[], storePayload, currentOrderDetails?.storefrontId || "");
      toast('success', 'Review submitted successfully!');
      onReviewModalClose();
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleGetReview = useCallback(async () => {
    setIsLoading(true);
    const order_id = currentOrderDetails?.orderNumber;
    try {
      const response = await debouncedGetReview(order_id as string);
      if (response.data.reviews && response.data.reviews.length > 0) {
        const reviewData = response.data.reviews;
        const reviewContents: { [key: string]: string } = {};

        reviewData.forEach((review: Review) => {
          reviewContents[review.productId] = review.content;
        });
        setExistingReviews(reviewData);
        setProductReviews(reviewContents);
      }
      setIsLoading(false);
    } catch {
      // Error handled silently
      setIsLoading(false);
    }
  }, [debouncedGetReview, currentOrderDetails?.orderNumber]);

  // Get product parameter
  const handleGetProductParameter = useCallback(async () => {
    setIsLoading(true);
    try {
      const productParameter = await debouncedGetProductParameter(currentOrderDetails?.storefrontId || "");
      setProductParameter(productParameter);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [debouncedGetProductParameter]);

  useEffect(() => {
    if (isReviewModalOpen && currentOrderDetails?.items && currentOrderDetails.items.length > 0) {
      handleGetProductParameter();
      handleGetReview();
    }
  }, [isReviewModalOpen, currentOrderDetails, handleGetProductParameter, handleGetReview]);

  // Render rating selectors for products
  const renderRatingSelectors = (item: OrderItem) => {
    const productId = item.productId;
    const existingReview = existingReviews.find(review => review.productId === productId);
    // If product already has a review, show existing ratings (read-only)

    if (existingReview) {
      return (
        <>
          {/* Parameter Ratings Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full">
            {existingReviews.map((review) =>
              review.parameter_review
                .filter(param => param.product_id === productId)
                .map(param => (
                  <RatingSelector
                    key={param.parameter_id}
                    label={param.parameter_name}
                    onChange={() => { }}
                    selectedRating={param.rating}
                  />
                ))
            )}
          </div>

          {/* Review Text Area Section */}
          <TextAreaField
            placeholder="Leave a review"
            containerClassName="w-full h-[73px]"
            value={existingReview.content || ""}
            onChange={() => { }} // Read-only
          />

          {/* Media Upload Section */}
          <div className="mb-4 flex flex-wrap gap-x-2">
            {existingReview?.media?.map((media: MediaType) => (
              <img key={media?.id} src={media?.value} alt="media" className="w-20 h-20 rounded-md" />
            ))}
          </div>
        </>
      );
    }

    // If no existing review, show blank parameters for rating
    const parameters = getParametersForProduct(item);
    return (
      <>
        {/* Parameter Ratings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full">
          {parameters.map((parameter: RatingParameter) => (
            <RatingSelector
              key={parameter.parameterId}
              label={`${parameter.parameterName}${parameter.mandatory ? "*" : ""}`}
              onChange={(rating) => handleProductRatingChange(productId, parameter.parameterId, rating)}
              selectedRating={productRatings[productId]?.[parameter.parameterId] || 0} // Show blank (0) if no rating
            />
          ))}
        </div>

        {/* Review Text Area Section */}
        <TextAreaField
          placeholder="Leave a review"
          containerClassName="w-full h-[73px]"
          value={productReviews[productId] || ""} // Show blank if no review
          onChange={(value) => handleProductReviewChange(productId, value)}
        />

        {/* Media Upload Section (one per product) */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="heading-5 mb-0 text-[var(--primary-text)]">Upload images</span>
            <span className="extra-small-font text-[var(--secondary-text)]">Supports : Png, Jpg, up to 5MB</span>
          </div>
          <div className="flex gap-3">
            <div
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => handleOpenUppyDialog(productId, "product")}
            >
              <img src={ADD_REVIEW_IMG} alt="Add Review" title="Add Review Image"
              className="w-10 h-10" />
            </div>
            {(parameterFiles[productId]?.["product"] || []).map((file) => (
              <FilePreview
                key={file?.id}
                file={file?.data}
                fileId={file?.id}
                onRemove={() => handleRemoveFile(productId, "product", file?.id)}
              />
            ))}
          </div>
        </div>
      </>
    );
  };

  // Check if store already has ratings
  const storeRatings = storeReviewUser?.data?.[0]?.ratings;
  const storeAlreadyRated = storeRatings && storeRatings.length > 0;

  return (
    <>
      <Modal
        isOpen={isReviewModalOpen}
        onClose={onReviewModalClose}
        title="Rate & Review"
        backArrowClassName="static md:hidden"
        closeIconClassName="static md:absolute hidden md:block"
        showBackArrow={true}
        titleClassName="review-modal-title"
        headerClassName="flex items-start justify-start gap-3 md:justify-between items-center flex-wrap mb-4 p-4 md:p-0 md:mb-3 review-modal-header"
        className="md:max-w-[968px] md:w-[85%] bg-[var(--quaternary-background)] review-modal-container"
      >
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
            <Loader />
          </div>
        )}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
            <Loader />
          </div>
        )}
        <div className="w-full px-4 md:px-0">
          {/* Restaurant Rating Section */}
          <div className="rate-restaurant border-b border-[var(--borders-dividers)] pb-6">
            <div className="flex flex-col">
              <p className="order-modal-description md-description-font font-700 pb-2">
                {rateRestaurantTitle}
              </p>
              <div className="bg-[var(--tertiary-active-background)] border border-[var(--border-secondary)] rounded-md p-2">
                <h3 className="description-font">
                  {currentOrderDetails?.storefrontName}
                </h3>
                <div className="flex items-center gap-x-1">
                  <Icon
                    icon={`${NAVIGATION_IMAGE}#nav-icon`}
                    width={18}
                    height={18}
                    color={"var(--primary-text)"}
                    className="cursor-pointer cross-icon-desktop"
                    viewBox="0 0 19 17"
                  />
                  <p className="extra-small-font md-small-font text-[var(--secondary-text)]">
                    {currentOrderDetails?.storeAddress?.addressLine1}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Rating Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full my-4">
              {storeAlreadyRated
                ? // Show existing store ratings (read-only)
                (storeRatings || []).map((item: { id: string; parameter_name: string; rating: number }) => (
                  <RatingSelector
                    key={item.id}
                    label={item.parameter_name}
                    onChange={() => { }} // Read-only
                    selectedRating={item.rating}
                  />
                ))
                : // Show blank store parameters for rating
                (storeParameter?.data || []).map((item: { id: string; name: string; is_required: boolean }) => (
                  <RatingSelector
                    key={item.id}
                    label={`${item.name}${item.is_required ? "*" : ""}`}
                    onChange={(value) => handleRestaurantRatingChange(item.id, value)}
                    selectedRating={restaurantRatings[item.id] || 0} // Show blank (0) if no rating
                  />
                ))}
            </div>

            {/* Store Review Text Area */}
            <TextAreaField
              placeholder="Leave a review"
              containerClassName="w-full md:mt-0 mt-4"
              onChange={storeAlreadyRated ? () => { } : (value) => handleRestaurantReviewChange(value)}
              value={storeAlreadyRated ? (storeReviewUser?.data?.[0]?.content ?? "") : restaurantReview}
            />
          </div>

          {/* Product Rating Section */}
          <div className="rate-food pb-0 pt-6">
            <div className="flex flex-col gap-y-2">
              <p className="font-700">{rateFoodTitle}</p>
              <div>
                {(currentOrderDetails?.items || []).map((item: OrderItem) => (
                  <div
                    key={item?.productId}
                    className="flex flex-col gap-y-4 mb-4 border-b border-[var(--borders-dividers)] last:border-b-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center gap-x-1 bg-[var(--primary-background)] rounded-md p-3">
                      <img
                        src={generateImageBase64FromUrl({url: item?.mediaURL || "", width: 150, quality: 100})?.fullEncodedUrl}
                        className="w-10 h-10 rounded-md"
                        alt="food"
                        width={18}
                        height={18}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 64, quality: 100})?.fullEncodedUrl || "";
                        }}
                        fetchPriority="high"
                      />
                      <p className="font-700 md-font-400 md-small-font">
                        {item?.productName?.en}
                      </p>
                    </div>
                    {renderRatingSelectors(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            className="w-full max-w-[220px] mt-2"
            onClick={onSubmit}
            isDisabled={
              loading ||
              (storeAlreadyRated ? false : !hasRequiredStoreRatings()) ||
              !hasRequiredStoreReview() ||
              !hasRequiredProductRatings() ||
              !hasRequiredProductReviews()
            }
          >
            {loading ? lang.Submitting : lang.Submit}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Parameter-specific Uppy Media Upload Dialog */}
      {activeUppyDialog && (
        <Modal
          isOpen={!!activeUppyDialog}
          onClose={handleCloseUppyDialog}
          title=""
          className="md:max-w-[800px] md:w-[90%] bg-[var(--quaternary-background)] media-upload-modal"
        >
          <div className="w-full">
            <UppyMediaUpload
              onUploadComplete={handleUploadComplete as (files: unknown[]) => void}
              className="mb-4"
              limit={5}
              fileTypes={['image/*', 'video/*']}
              maxSize={50 * 1024 * 1024} // 50MB
              sourceDirectory="plateaway/review-media"
            />
          </div>
        </Modal>
      )}

      <style>{`
        .small-font {
          font-size: var(--small-font);
        }
        .extra-small-font {
          font-size: var(--extraSmall-font);
        }
        .description-font {
          font-size: var(--description-font);
        }
        .heading-4 {
          font-size: var(--heading-h4);
        }
        .font-400 {
          font-weight: var(--font-regular);
        }
        .font-600 {
          font-weight: var(--font-semi-bold);
        }
        .font-700 {
          font-weight: var(--font-bold);
        }
        .order-modal-description {
          font-size: var(--description-font);
          font-weight: var(--font-bold);
        }
        .review-modal-container{
          max-height: 90vh !important;
        }
        .media-upload-modal{
          max-height: 90vh !important;
          height: 100vh !important;
        }

        .review-modal-title {
          font-weight: var(--font-semi-bold) !important;
        }

        @media (max-width: 768px) {
          .md-small-font {
            font-size: var(--small-font);
          }
          .md-description-font {
            font-size: var(--description-font);
          }
          .md-font-400 {
            font-weight: var(--font-regular);
          }
          .review-modal-container{
            max-height: 100vh !important;
            padding:0px !important;
          }
          .media-upload-modal{
            max-height: 100vh !important;
            height: 100vh !important;
          }
          .review-modal-title {
            font-size: var(--heading-h4) !important;
          }
          
          .review-modal-header {
            background-color: var(--primary-background) !important;
            border-bottom: 1px solid var(--borders-dividers) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ReviewModal;