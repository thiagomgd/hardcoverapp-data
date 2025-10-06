import React from "react";
import type { BookInfo } from "../types";
import { BOOK_CATEGORIES_MAP, LITERARY_TYPES_MAP } from "../types";
import { formatAudioDuration } from "../utils/formatDuration";

interface BookCardProps {
  book: BookInfo;
  index: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  return (
    <div
      key={`${book.id}-${index}`}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight flex-1 mr-3">
          {book.title}
        </h3>
        {book.image && (
          <img
            src={book.image}
            alt={book.title}
            className="w-15 h-20 object-cover ml-2 rounded"
          />
        )}
      </div>

      <div className="space-y-3">
        {book.author && (
          <p className="text-gray-600 italic">by {book.author}</p>
        )}

        {book.link && (
          <p>
            <a
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              🔗 View on Hardcover
            </a>
          </p>
        )}

        {book.categoryId && BOOK_CATEGORIES_MAP[book.categoryId] && (
          <div className="text-sm text-gray-600">
            <strong>Category:</strong> {BOOK_CATEGORIES_MAP[book.categoryId]}
          </div>
        )}

        {book.literaryTypeId && LITERARY_TYPES_MAP[book.literaryTypeId] && (
          <div className="text-sm text-gray-600">
            <strong>Literary Type:</strong>{" "}
            {LITERARY_TYPES_MAP[book.literaryTypeId]}
          </div>
        )}

        {book.rating && book.rating > 0 && (
          <div className="font-medium text-yellow-600">⭐ {book.rating}/5</div>
        )}

        {book.hasReview && (
          <div className="text-green-600 font-medium">📝 Has Review</div>
        )}

        {book.tbrLists && book.tbrLists.length > 0 && (
          <div>
            <strong className="text-gray-700">TBR Lists:</strong>
            <div className="mt-1">
              {book.tbrLists.map((list: string, i: number) => (
                <span
                  key={i}
                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                >
                  {list}
                </span>
              ))}
            </div>
          </div>
        )}

        {book.editionsOwned && book.editionsOwned.length > 0 && (
          <div className="text-sm text-gray-600">
            <strong>Owned Editions:</strong> {book.editionsOwned.length}
          </div>
        )}

        {book.editionsRead && book.editionsRead.length > 0 && (
          <div className="text-sm text-gray-600">
            <strong>Read Editions:</strong> {book.editionsRead.length}
          </div>
        )}

        {book.listeningDuration != null && book.listeningDuration > 0 && (
          <div className="text-sm text-gray-600">
            <strong>🎧 Audio Duration:</strong>{" "}
            {formatAudioDuration(book.listeningDuration)}
          </div>
        )}

        <div className="text-sm">
          <a
            href={`https://howlongtoread.com/results/${encodeURIComponent(book.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            📖 Check reading time on How Long to Read
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
