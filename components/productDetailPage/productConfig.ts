import { MediaType, Review, Variant } from "@components/type/pdp.type";

  
export const getHeadingLabel = (option: Variant): string => {

  if( option?.attributes && option?.attributes?.length > 0){
    return option.attributes[0]?.value;
  }
  else if(option?.sku){
    const lastChar = option?.sku?.charAt(option?.sku?.length - 1);
    if ( lastChar === 'S') {
      return 'Small';
    } else if (lastChar === 'R') {
      return 'Regular';
    } 
    else if (lastChar === 'M') {
      return 'Medium';
    }else {
      return 'Large';
    }
  }
  else{
    if (option?.nutritionInfo?.servingSize) {
      switch (option.nutritionInfo.servingSize) {
        case '1':
          return 'Small';
        case '2':
          return 'Regular';
        default:
          return 'Large';
      }
    }
    else{
      return 'Regular';
    }
  }
};

export const getAllMediaUrl = (reviews: Review[]): MediaType[] => {
  if(!reviews){
    return []
  }
  return reviews.flatMap(item =>
    item.media.map(mediaItem => ({
      reviewId: item.reviewId,
      media: mediaItem,
      value: mediaItem
    }))
  );
};

export const getMediaArray = (review: Review): MediaType[] => {
  if(!review){
    return []
  }
  return review.media.map(mediaItem => ({
    reviewId: review.reviewId,
    media: mediaItem,
    value: mediaItem
  }))
}

