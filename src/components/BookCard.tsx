import React from "react";
import type { BookInfo } from "../types";
import { BOOK_CATEGORIES_MAP, LITERARY_TYPES_MAP } from "../types";
import { formatAudioDuration } from "../utils/formatDuration";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import styles from "./BookCard.module.css";

interface BookCardProps {
  book: BookInfo;
  index: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  return (
    <div key={`${book.id}-${index}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{book.title}</h3>
        {book.image && (
          <img src={book.image} alt={book.title} className={styles.image} />
        )}
      </div>

      <div className={styles.content}>
        {book.author && <p className={styles.author}>by {book.author}</p>}

        {book.link && (
          <p>
            <a
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              🔗 View on Hardcover
            </a>
          </p>
        )}

        {book.categoryId && BOOK_CATEGORIES_MAP[book.categoryId] && (
          <div className={styles.metadata}>
            <strong>Category:</strong> {BOOK_CATEGORIES_MAP[book.categoryId]}
          </div>
        )}

        {book.literaryTypeId && LITERARY_TYPES_MAP[book.literaryTypeId] && (
          <div className={styles.metadata}>
            <strong>Literary Type:</strong>{" "}
            {LITERARY_TYPES_MAP[book.literaryTypeId]}
          </div>
        )}

        {book.rating && book.rating > 0 && (
          <div className={styles.rating}>⭐ {book.rating}/5</div>
        )}

        {book.hasReview && (
          <div className={styles.hasReview}>📝 Has Review</div>
        )}

        {book.tbrLists && book.tbrLists.length > 0 && (
          <div className={styles.tbrSection}>
            <strong>TBR Lists:</strong>
            <div className={styles.tbrLists}>
              {book.tbrLists.map((list: string, i: number) => (
                <span key={i} className={styles.tbrBadge}>
                  {list}
                </span>
              ))}
            </div>
          </div>
        )}

        {book.editionsOwned && book.editionsOwned.length > 0 && (
          <div className={styles.metadata}>
            <strong>Owned Editions:</strong> {book.editionsOwned.length}
          </div>
        )}

        {book.editionsRead && book.editionsRead.length > 0 && (
          <div className={styles.metadata}>
            <strong>Read Editions:</strong> {book.editionsRead.length}
          </div>
        )}

        {book.listeningDuration != null && book.listeningDuration > 0 && (
          <>
            <div className={styles.metadata}>
              <strong>🎧 Audio Duration:</strong>{" "}
              {formatAudioDuration(book.listeningDuration)}
            </div>
            <div className={styles.metadata}>
              <strong>📚 Estimated reading time:</strong>{" "}
              {calculateReadingTime(book)}
            </div>
          </>
        )}

        <div>
          <a
            href={`https://howlongtoread.com/results/${encodeURIComponent(book.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.howLongLink}
          >
            📖 Check reading time on How Long to Read
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
