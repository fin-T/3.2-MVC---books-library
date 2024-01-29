import express, { Request, Response } from "express";
import fs from "fs";
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../utils/connect_to_db';

const client = express.Router();

client
    .route("/")
    .get((req, res) => {
        console.log('"/" get: ', req.query);
        if (req.query.search) return sendBookDataByTitle(req, res);
        sendsBooksTemplate(req, res);
    })

client
    .route('/search')
    .get(async (req, res) => {
        console.log('/search get: ', req.query);
        sendBookDataByTitle(req, res);
    })

client
    .route("/api/v1/books")
    .get((req, res) => {
        console.log('"/api/v1/books" get: ', req.query);
        sendsBooksData(req, res);
    })

client
    .route('/book/:id')
    .get((req, res) => {
        console.log('"/book/:id" get: ', req.params);
        sendBookTemplate(req, res);
    })

client
    .route('/api/v1/books/:id')
    .get((req, res) => {
        console.log('"/api/v1/books/:id" get: ', req.params);
        increaseVisitsCounter(req, res);
        increaseDesiresCounter(req, res);
        sendBookData(req, res);
    })

/**
 * Sends data from books from the database whose titles contain the text sent in the request.
 * 
 * @param req Client request. Contains text for searching books by title.
 * @param res Server response. Book data in json form.
 */
async function sendBookDataByTitle(req: Request, res: Response) {
    try {
        let offset = Number(req.query.offset);
        let limit = Number(req.query.limit);

        let textOfTitle = req.query.text?.toString().toLowerCase();
        let getBooksByTitle = fs.readFileSync('sqlScripts/get_books_by_title.sql', 'utf-8');
        let [books] = await pool.query<RowDataPacket[]>(getBooksByTitle, [textOfTitle]);

        let searchedBooks = [];
        for (let book of books) {
            if (book.title.toLowerCase().includes(textOfTitle)) {
                searchedBooks.push(book);
            }
        }
        let result = {
            'success': true,
            'data': {
                'books': searchedBooks,
                'total': {
                    'amount': searchedBooks.length
                },
                'filter': req.query.filter,
                'offset': offset,
                'limit': limit
            }
        }
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(501).send({
            error: 'Error retrieving book data.'
        });
    }
}

/**
 * Increases the value in the purchases column for the book obtained from the request parameters.
 * 
 * @param req Request from a client. Parameters must contain id.
 * @param res Server response. Not getting through.
 */
export async function increaseDesiresCounter(req: Request, res: Response) {
    try {
        if (req.query.purchase) {
            let bookID = req.params.id;
            console.log(bookID);
            let increaseWishCounter = fs.readFileSync('sqlScripts/icrease_desires_counter.sql', 'utf-8');
            await pool.query(increaseWishCounter, [bookID]);
        }
    } catch (error) {
        console.log(error);
        res.status(501).send({
            error: 'Error increasing the desires counter in table "books".'
        });
    }
}

/**
 * Increases the value in the visits column for the book obtained from the request parameters.
 * 
 * @param req Request from a client. Parameters must contain id.
 * @param res Server response. Not getting through.
 */
export async function increaseVisitsCounter(req: Request, res: Response) {
    try {
        if (req.query.visit) {
            let bookID = req.params.id;
            let increaseVisitsCounter = fs.readFileSync('sqlScripts/increase_visits_counter.sql', 'utf-8');
            await pool.query(increaseVisitsCounter, [bookID]);
        }
    } catch (error) {
        console.log(error);
        res.status(501).send({
            error: 'Error increasing the visits counter in table "books".'
        });
    }
}

/**
 * Sends book data to the client in accordance with the requested book id.
 * 
 * @param req Request from a client. Parameters must contain id.
 * @param res Books data in json form.
 */
async function sendBookData(req: Request, res: Response) {
    try {
        let getBook = fs.readFileSync('sqlScripts/get_book.sql', 'utf8');
        let id = req.params.id;
        let [[book]] = await pool.query<RowDataPacket[]>(getBook, id);
        let result = {
            'success': true,
            'data': {
                'id': book.id,
                // 'event': {
                //     'keyCode': 13,
                // },
                'book': book
            }
        }
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

/**
 * Sends a book page template.
 * 
 * @param req Client request.
 * @param res Server response.
 */
async function sendBookTemplate(req: Request, res: Response) {
    try {
        let bookTemplate = fs.readFileSync("front/books/book-page/book-page.html", "utf-8");
        res.send(bookTemplate);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

/**
 * Sends a books page template.
 * 
 * @param req Client request.
 * @param res Server response.
 */
function sendsBooksTemplate(req: Request, res: Response) {
    try {
        let booksTemplate = fs.readFileSync("front/books/books-page/books-page.html", "utf-8");
        res.send(booksTemplate);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

/**
 * Sends book data according to the requested data.
 * 
 * @param req Client request. Contains offset and limit in querystring.
 * @param res Server response with book data.
 */
async function sendsBooksData(req: Request, res: Response) {
    try {
        let getBooks = fs.readFileSync('sqlScripts/get_books.sql', 'utf8');
        let [books] = await pool.query<RowDataPacket[]>(getBooks);
        let offset = Number(req.query.offset);
        let limit = Number(req.query.limit);
        let result = {
            'success': true,
            'data': {
                'books': books.slice(offset, offset + limit),
                'total': {
                    'amount': books.length
                },
                'filter': req.query.filter,
                'offset': offset,
                'limit': limit
            }
        }
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

module.exports = client;