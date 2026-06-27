import AnimeCard from "./AnimeCard";
import SwiperCarousel from "../home/SwiperCarousel";

export default function RelatedAnime({ relations = [], recommendations = [] }) {
  if (!relations?.length && !recommendations?.length) return null;

  return (
    <div className="space-y-8">
      {relations?.length > 0 && (
        <SwiperCarousel
          title="Related"
          anime={relations}
          renderItem={(rel) => (
            <div>
              <AnimeCard anime={rel} />
              {rel.relationType && (
                <p className="text-xs text-text-muted mt-1 text-center capitalize truncate">
                  {rel.relationType.replace(/_/g, " ").toLowerCase()}
                </p>
              )}
            </div>
          )}
        />
      )}

      {recommendations?.length > 0 && (
        <SwiperCarousel
          title="You Might Also Like"
          anime={recommendations}
        />
      )}
    </div>
  );
}
