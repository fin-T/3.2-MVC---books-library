INSERT INTO authors_and_books (authorIDs, bookIDs)
SELECT MAX(authorIDs), MAX(bookIDs)
FROM (authors, books);