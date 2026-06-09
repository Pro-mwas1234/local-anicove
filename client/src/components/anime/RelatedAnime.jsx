import AnimeCard from "./AnimeCard";

export default function RelatedAnime({ relations = [], recommendations = [] }) {
  const items = [
    ...(relations || []).map((r) => ({ ...r, _type: "relation" })),
    ...(recommendations || []).map((r) => ({ ...r, _type: "recommendation" })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {relations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Related</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {relations.map((rel, idx) => (
              <div key={idx} className="shrink-0 w-40">
                <AnimeCard anime={rel} />
                {rel.relationType && (
                  <p className="text-xs text-text-muted mt-1 text-center capitalize">
                    {rel.relationType.replace(/_/g, " ").toLowerCase()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">You Might Also Like</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="shrink-0 w-40">
                <AnimeCard anime={rec} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
