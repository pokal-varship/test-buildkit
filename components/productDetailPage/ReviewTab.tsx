import RatingBreakdown from "@components/ratings/RatingBreakdown";
import RatingButton from "@components/ratings/RatingButton";
import StarRatingSummary from "@components/ratings/StarRatingSummary";
import useLang from '@hooks/useLang';
import { FC, useMemo } from "react";
import { LanguageCode, TranslationKeys } from 'types';
import MediaSlider from "./MediaSlider";
// import AIGeneratedSummary from "./AIGeneratedSummary";
import { ProductResponse } from "@components/type/pdp.type";
import { useGetProductReviews } from "@hooks/useGetProductReviews";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { getAllMediaUrl } from "./productConfig";

type ReviewTabProps = {
  productData: ProductResponse | null;
}

const ReviewTab: FC<ReviewTabProps> = ({ productData }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { reviewsData, allReviews } = useSelector((state: RootState) => state.productReviews);
  useGetProductReviews({ productId: productData?.data?.id as string, status: 1 });
  // const dispatch = useDispatch();


  const breakdownData = useMemo(() => {
    if (!reviewsData) return [];

    return [
      {
        rating: 5,
        count: reviewsData?.data?.startCount?.fiveCount || 0,
        color: "var(--rating-bg-success-primary)",
    },
    {
      rating: 4,
      count: reviewsData?.data?.startCount?.fourCount || 0,
      color: "var(--rating-bg-success-secondary)",
    },
    {
      rating: 3,
      count: reviewsData?.data?.startCount?.threeCount || 0,
      color: "var(--rating-bg-warning-primary)",
    },
    {
      rating: 2,
      count: reviewsData?.data?.startCount?.twoCount || 0,
      color: "var(--rating-bg-warning-secondary)",
    },
    {
      rating: 1,
      count: reviewsData?.data?.startCount?.oneStart || 0,
        color: "var(--rating-bg-error-primary)",
      },
    ];
  }, [reviewsData]);
  // const onReviewTileClick = (item: Review) => {
  //   dispatch(setCurrentReview(item));
  // }
  const allMedias = useMemo(() => {
    return getAllMediaUrl(allReviews);
  }, [allReviews]);

  return (
    <div className="w-full flex flex-col gap-2 md:gap-4">
      <div className="w-full flex flex-row items-center justify-between md:justify-start gap-5  gap-y-4  md:gap-10 lg:gap-16">
        <StarRatingSummary
          rating={Number(reviewsData?.data?.avgrating?.toFixed(1)) || 0}
          totalRatings={reviewsData?.data?.totalrating ? `${reviewsData?.data?.totalrating.toFixed(1)} ${lang.rating}` : undefined}
          totalReviews={reviewsData?.data?.totaluser ? `${reviewsData?.data?.totaluser.toFixed(1)} ${lang.review}` : undefined}
          ratingWrapperClassName="flex-col md:flex-row gap-1 md:gap-3"
        />
        <RatingBreakdown breakdownData={breakdownData} />
      </div>
      <div className="grid grid-cols-2 gap-x-[10px] gap-y-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {reviewsData?.data?.parameterRating?.map((item, index) => (
          <RatingButton key={index} rating={Number(item?.avgRating?.toFixed(1)) || 0} description={item?.parameterName} />
        ))}
      </div>
      {/* <AIGeneratedSummary /> */}
      {allMedias && allMedias.length > 0 && (
        <div className="w-full relative">
          <h3 className="md:text-xl font-semibold mb-4">{lang.mediaFromReviews}</h3>
          <MediaSlider media={allMedias} showViewMore={true} />
        </div>
      )}
      {/* {allReviews && allReviews.length > 0 && (
        <div className="w-full mt-2 md:mt-0">
          <h2 className="small-font md:text-xl font-semibold">{lang.reviews}</h2>
          {allReviews?.map((item, index) => (
            <ReviewTile
              onTileClick={() => onReviewTileClick(item)}
              key={index}
              rating={item?.rating}
              media={getMediaArray(item)}
              title={`${item?.firstName || ''} ${item?.lastName || ''}`}
              description={item?.content || ''}
              date={timeSince(item?.updatedAt || 0)}
            />
          ))}
        </div>
      )} */}
    </div>
  );
  <style>
    {`
            .small-font{
                font-size: var(--small-font);
            }
        `}
  </style>
};

export default ReviewTab;
