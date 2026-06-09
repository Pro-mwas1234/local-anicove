import AnimeGrid from "../components/anime/AnimeGrid";
import { useMyList } from "../hooks/useMyList";

export default function MyListPage() {
  const { myList } = useMyList();

  return (
    <div id="mylist-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
      <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">
        My List
      </h1>
      <p className="text-text-secondary mb-8">
        {myList.length > 0
          ? `${myList.length} anime saved to your list`
          : "Your watchlist is empty"}
      </p>

      {myList.length > 0 ? (
        <AnimeGrid anime={myList} />
      ) : (
        <div className="text-center py-20 space-y-4">
          <svg className="w-16 h-16 text-text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-text-muted text-lg">
            Start adding anime to your list by clicking the "My List" button on any anime page.
          </p>
        </div>
      )}
    </div>
  );
}
