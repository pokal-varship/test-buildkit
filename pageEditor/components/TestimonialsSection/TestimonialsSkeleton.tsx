import React from 'react';

/**
 * Skeleton loading component for TestimonialsSection
 * Used as fallback in Suspense boundary during PPR/streaming
 */
export function TestimonialsSkeleton() {
  return (
    <div 
      className="testimonials-skeleton container mx-auto"
      aria-label="Loading testimonials"
      role="status"
    >
      {/* Header skeleton */}
      <div className="testimonials-skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
      </div>
      
      {/* Cards skeleton */}
      <div className="testimonials-skeleton-cards">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            {/* Stars */}
            <div className="skeleton-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="skeleton-star"></div>
              ))}
            </div>
            {/* Review text lines */}
            <div className="skeleton-review">
              <div className="skeleton-line skeleton-line-full"></div>
              <div className="skeleton-line skeleton-line-full"></div>
              <div className="skeleton-line skeleton-line-3/4"></div>
              <div className="skeleton-line skeleton-line-1/2"></div>
            </div>
            {/* Author */}
            <div className="skeleton-author"></div>
          </div>
        ))}
      </div>

      <style>{`
        .testimonials-skeleton {
          padding: 40px 30px;
          background: transparent;
        }
        
        .testimonials-skeleton-header {
          text-align: center;
          margin-bottom: 56px;
        }
        
        .skeleton-title {
          height: 36px;
          width: 300px;
          margin: 0 auto 16px;
          background: linear-gradient(90deg, var(--borders-dividers, #D7D5C4) 25%, var(--secondary-background, #FAF9F1) 50%, var(--borders-dividers, #D7D5C4) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        
        .skeleton-subtitle {
          height: 20px;
          width: 400px;
          max-width: 90%;
          margin: 0 auto;
          background: linear-gradient(90deg, var(--borders-dividers, #D7D5C4) 25%, var(--secondary-background, #FAF9F1) 50%, var(--borders-dividers, #D7D5C4) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
        
        .testimonials-skeleton-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .skeleton-card {
          background: var(--cards-containers, var(--white, #FFFFFF));
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 4px 12px var(--borders-dividers, rgba(0, 0, 0, 0.05));
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }
        
        .skeleton-stars {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
        }
        
        .skeleton-star {
          width: 16px;
          height: 16px;
          background: linear-gradient(90deg, var(--borders-dividers, #D7D5C4) 25%, var(--secondary-background, #FAF9F1) 50%, var(--borders-dividers, #D7D5C4) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 2px;
        }
        
        .skeleton-review {
          flex-grow: 1;
          margin-bottom: 16px;
        }
        
        .skeleton-line {
          height: 14px;
          margin-bottom: 8px;
          background: linear-gradient(90deg, var(--borders-dividers, #D7D5C4) 25%, var(--secondary-background, #FAF9F1) 50%, var(--borders-dividers, #D7D5C4) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        
        .skeleton-line-full {
          width: 100%;
        }
        
        .skeleton-line-3\\/4 {
          width: 75%;
        }
        
        .skeleton-line-1\\/2 {
          width: 50%;
        }
        
        .skeleton-author {
          height: 14px;
          width: 120px;
          background: linear-gradient(90deg, var(--borders-dividers, #D7D5C4) 25%, var(--secondary-background, #FAF9F1) 50%, var(--borders-dividers, #D7D5C4) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-top: auto;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @media (max-width: 1024px) {
          .testimonials-skeleton-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .testimonials-skeleton {
            padding: 24px 16px;
          }
          
          .testimonials-skeleton-header {
            margin-bottom: 24px;
          }
          
          .skeleton-title {
            height: 28px;
            width: 200px;
          }
          
          .skeleton-subtitle {
            height: 16px;
            width: 280px;
          }
          
          .testimonials-skeleton-cards {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .skeleton-card {
            min-height: 180px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default TestimonialsSkeleton;

