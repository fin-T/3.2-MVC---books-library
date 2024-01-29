SELECT 
  books.`bookIDs` AS id,
  books.title AS title,
  GROUP_CONCAT(authors.authors SEPARATOR ', ') AS author,
  books.visits AS visits,
  books.purchases AS purchases,
  books.action AS action
FROM books
JOIN authors_and_books ON authors_and_books.bookIDs = books.bookIDs
JOIN authors ON authors_and_books.authorIDs = authors.authorIDs
WHERE LOWER(books.title) LIKE CONCAT('%', ?, '%')
GROUP BY books.`bookIDs`, books.title, books.visits, books.purchases, books.action;

