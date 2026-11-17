import { fetchTestimonialsResolvedData } from "pageEditor/data/fetchTestimonialsResolvedData";
import { TestimonialsSectionProps } from "../components/TestimonialsSection/fields";

interface TestimonialsResolvedData {
  testimonials: Array<{
    id: string;
    name: string;
    rating: number;
    review: string;
    avatar: string;
    location: string;
    orderId: string;
    createdAt: string;
    status: string;
  }>;
  loading: boolean;
  error: string | null;
  totalReviews: number;
}

export class TestimonialsDataContext {
  private static instance: TestimonialsDataContext;

  private constructor() {}

  static getInstance(): TestimonialsDataContext {
    if (!TestimonialsDataContext.instance) {
      TestimonialsDataContext.instance = new TestimonialsDataContext();
    }
    return TestimonialsDataContext.instance;
  }

  async getResolvedData(props: TestimonialsSectionProps, token?: string, storeId?: string): Promise<TestimonialsResolvedData> {
    try {
      const resolvedData = await fetchTestimonialsResolvedData(props, token, storeId);
      return resolvedData;
    } catch (error) {
      return {
        testimonials: [],
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch testimonials",
        totalReviews: 0
      };
    }
  }
}

export const testimonialsDataContext = TestimonialsDataContext.getInstance(); 