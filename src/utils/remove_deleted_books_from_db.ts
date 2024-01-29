import fs from 'fs';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from './connect_to_db';

/**
 * Removes deleted books with a value of true or 1 in the action column from the database in the books table, 
 * as well as rows in the authors table that have the same identifiers as the deleted books in the bookIDs column. 
 * Also removes the image of the deleted book from the project folder.
 */
export async function removeDeletedBooks() {
    const getBookIDsToDelete = fs.readFileSync('sqlScripts/get_book_ids_to_delete.sql', 'utf-8');
    let [bookIDsToDelete] = await pool.query<RowDataPacket[]>(getBookIDsToDelete, [true]);
    bookIDsToDelete = bookIDsToDelete.map(bookID => bookID.bookIDs);

    await removeBooksFromBooksTable(bookIDsToDelete);
    await removeAuthorsFromAuthorsTable(bookIDsToDelete);

    const resetAutoIncrementAuthorsAndBooks =
        fs.readFileSync('sqlScripts/reset_auto_increment_authors_and_books.sql', 'utf-8');
    await pool.query(resetAutoIncrementAuthorsAndBooks).catch(err => {
        console.error(err);
        console.log('Error resetting auto-incrementing author_and_book_IDs in the authors_and_books table.');
    });

    removeDeletedBookImages(bookIDsToDelete);
}

/**
 * Deletes rows that have values in the bookIDs column that are the same as 
 * those received in the function arguments.
 * 
 * @param bookIDs Book ids for delete rows in the table authors.
 */
async function removeAuthorsFromAuthorsTable(bookIDs: RowDataPacket[]) {
    const getAuthorIDsByBookID = fs.readFileSync('sqlScripts/get_authorIDs_by_bookID.sql', 'utf-8');
    const removeAuthorsByBookID =
        fs.readFileSync('sqlScripts/remove_selected_book_authors_by_book_ID.sql', 'utf-8');

    for (const bookID of bookIDs) {
        const [authorIDs] = await pool.query<RowDataPacket[]>(getAuthorIDsByBookID, [bookID]);
        for (const authorID of authorIDs) {
            const id = authorID.authorIDs;
            await pool.query(removeAuthorsByBookID, [id]).catch(err => {
                console.error(err);
                console.log('Error removing authors by book id in table "books".');
            });
        }
    }

    const resetAutoIncrementAuthors = fs.readFileSync('sqlScripts/reset_auto_increment_authors.sql', 'utf-8');
    await pool.query(resetAutoIncrementAuthors).catch(err => {
        console.error(err);
        console.log('Error resetting the auto-increment of the linking identifier in the authors_and_books table.');
    });
}

/**
 * Removes deleted books with a value of true or 1 in the action column from the database in the books table.
 * 
 * @param bookIDsToDelete BookIds to delete.
 */
async function removeBooksFromBooksTable(bookIDsToDelete: RowDataPacket[]) {
    const removeSelectedBook = fs.readFileSync('sqlScripts/remove_selected_book.sql', 'utf-8');
    for (const bookIDtoDelete of bookIDsToDelete) {
        await pool.query(removeSelectedBook, [bookIDtoDelete]).catch(err => {
            console.error(err);
            console.log('Error removing a deleted book in table "books".');
        });
    }

    const reloadAutoIncrementBookIDs = fs.readFileSync('sqlScripts/reset_auto_increment_book_ids.sql', 'utf-8');
    await pool.query(reloadAutoIncrementBookIDs).catch(err => {
        console.log('Error resetting automatic incrementing of book IDs in table "books".');
        console.error(err);
    });
}

/**
 * Removes images of deleted books from the project folder.
 * 
 * @param bookIDs Book file names to delete without. Works only with .jpg format images.
 */
function removeDeletedBookImages(bookIDs: RowDataPacket[]) {
    const filesLocation = 'front/books/books-page/books-page_files/';
    const filePaths = [];
    for (const bookID of bookIDs) {
        const filePath = filesLocation + bookID + '.jpg';
        filePaths.push(filePath);
    }

    for (const filePath of filePaths) {
        fs.stat(filePath, (err) => {
            if (err) {
                console.log('Error checking file:', err);
            } else {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log('Error deleting file:', err);
                    } else {
                        console.log('File deleted successfully.');
                    }
                });
            }
        });
    }
}

module.exports = {
    removeDeletedBooks
}