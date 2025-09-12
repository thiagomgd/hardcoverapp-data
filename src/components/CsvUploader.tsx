import React, { useState, useCallback } from "react";
import type { HardcoverBook, CsvUploadResult } from "../types";

interface CsvUploaderProps {
  onDataLoaded: (result: CsvUploadResult) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const parseCsvData = useCallback((csvText: string): CsvUploadResult => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return {
        books: [],
        totalCount: 0,
        errors: ["CSV file must have at least a header and one data row"],
      };
    }

    const headers = parseCsvLine(lines[0]);
    const books: HardcoverBook[] = [];
    const errors: string[] = [];

    // Map CSV headers to our interface properties
    const headerMap: { [key: string]: string } = {
      Title: "title",
      Author: "author",
      Series: "series",
      Status: "status",
      Privacy: "privacy",
      "Hardcover Book ID": "hardcoverBookId",
      "Hardcover Edition ID": "hardcoverEditionId",
      "ISBN 10": "isbn10",
      "ISBN 13": "isbn13",
      ASIN: "asin",
      Media: "media",
      "Country Code": "countryCode",
      "Language Code": "languageCode",
      Binding: "binding",
      Pages: "pages",
      "Duration in Seconds": "durationInSeconds",
      "Publish Date": "publishDate",
      Publisher: "publisher",
      Genres: "genres",
      Moods: "moods",
      Tags: "tags",
      "Content Warnings": "contentWarnings",
      Lists: "lists",
      "Date Added": "dateAdded",
      "Date Started": "dateStarted",
      "Date Finished": "dateFinished",
      Rating: "rating",
      Review: "review",
      "Review Contains Spoilers": "reviewContainsSpoilers",
      "Sponsored Review": "sponsoredReview",
      "Review Date": "reviewDate",
      "Review URL": "reviewUrl",
      "Review Media URL": "reviewMediaUrl",
      "Private Notes": "privateNotes",
      Owned: "owned",
      Compilation: "compilation",
      "Review Slate": "reviewSlate",
    };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        if (values.length !== headers.length) {
          errors.push(
            `Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`,
          );
          continue;
        }

        const book: Partial<HardcoverBook> = {};

        headers.forEach((header, index) => {
          const mappedProperty = headerMap[header];
          if (mappedProperty && values[index] !== undefined) {
            const value = values[index];

            // Type conversion based on property
            switch (mappedProperty) {
              case "hardcoverBookId":
              case "hardcoverEditionId":
              case "pages":
              case "durationInSeconds":
                (book as Record<string, unknown>)[mappedProperty] = value
                  ? parseInt(value, 10) || 0
                  : 0;
                break;
              case "rating":
                (book as Record<string, unknown>)[mappedProperty] = value
                  ? parseFloat(value) || 0
                  : 0;
                break;
              case "reviewContainsSpoilers":
              case "sponsoredReview":
              case "owned":
              case "compilation":
                (book as Record<string, unknown>)[mappedProperty] =
                  value.toLowerCase() === "true";
                break;
              default:
                (book as Record<string, unknown>)[mappedProperty] = value || "";
            }
          }
        });

        // Validate required fields
        if (!book.title) {
          errors.push(`Row ${i + 1}: Missing required field (title)`);
          continue;
        }

        books.push(book as HardcoverBook);
      } catch (error) {
        errors.push(
          `Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return {
      books,
      totalCount: books.length,
      errors,
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Please select a CSV file");
        return;
      }

      setIsLoading(true);

      try {
        const text = await file.text();
        const result = parseCsvData(text);
        onDataLoaded(result);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [onDataLoaded, parseCsvData],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? "border-blue-500 bg-blue-50 scale-105"
            : isLoading
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-green-600 font-medium">Processing CSV file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl opacity-60">📁</div>
            <h3 className="text-2xl text-gray-800">
              Upload Hardcover CSV Export
            </h3>
            <p className="text-gray-600">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors"
            >
              Browse Files
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvUploader;
