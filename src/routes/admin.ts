import express, { Request, Response } from "express";
import fs from "fs";
import { RowDataPacket } from 'mysql2/promise';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from "bcrypt";
import bodyParser from 'body-parser';
import { upload } from "../utils/config_of_upload_files";
import { pool } from '../utils/connect_to_db';
import { v4 as uuidv4 } from 'uuid';

const FileStore = require('session-file-store')(session);
const admin = express.Router();

declare module "express-session" {
    interface SessionData {
        login: string;
    }
}

admin.use(cookieParser());
admin.use(session({
    store: new FileStore({ path: 'sessions' }),
    secret: uuidv4(),
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 30 * 60 * 1000)
    }
}));
admin.use('/static', express.static('front'));
admin.use(bodyParser.json());
admin.use(bodyParser.urlencoded({ extended: true }));

admin
    .route('/')
    .get(async (req, res) => {
        console.log('"/admin": get', req.query);
        if (await authorized(req, res)) return sendAdminTemplate(req, res);
        sendAuthorizationTemplate(req, res);
    })
    .post((req, res) => {
        console.log('"/admin": post', req.body);
        login(req, res);
    })

admin 
    .route('/logout')
    .get((req, res) => {
        logout(req, res);
    })

admin
    .route('/api/v1')
    .get((req, res) => {
        console.log('/admin/api/v1 get ', req.query);
        console.log('/admin/api/v1 get ', req.params);
        console.log('/admin/api/v1 get ', req.body);
        sendBookStatistic(req, res);
    })
    // This route is used to download the resulting image to the project folder.
    .post(upload.single('image'), (req, res) => {
        console.log('/admin/api/v1 post ', req.body);
        addBookToDataBase(req, res);
        sendBookStatistic(req, res);
    })
    .put((req, res) => {
        console.log('//admin/api/v1 put ', req.body.id);
        changeBookStatus(req, res);
    })

/**
 * Changes the value in the action column to the opposite for rows that have a certain identifier.
 * 
 * @param req A client request containing the book ID.
 * @param res Server response with information about the identifier and status value of the book.
 */
async function changeBookStatus(req: Request, res: Response) {
    try {
        let bookID = req.body.id;
        let changeBookStatus = fs.readFileSync('sqlScripts/change_book_status.sql', 'utf-8');
        await pool.query(changeBookStatus, [bookID]);

        let get_book = fs.readFileSync('sqlScripts/get_book.sql', 'utf8');
        let [[book]] = await pool.query<RowDataPacket[]>(get_book, [bookID]);

        let result = {
            'success': true,
            'data': {
                'id': bookID,
                'bookStatus': book.action,
            }
        }
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(501).send({
            error: "The request was not completed. The server did not support the functionality required."
        });
    }
}

/**
 * Delete session data and cookies, then redirects to the login route.
 * 
 * @param req Client request.
 * @param res Server response.
 */
function logout(req: Request, res: Response) {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log("Session destroyed");
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect('/admin');
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: `The request was not completed. The server met an unexpected condition.` });
    }
}

/**
 * Adds new books to the database.
 * 
 * @param req Client request. The request body can contain information about the authors, the title of the book.
 * @param res Server response. Contains nothing.
 */
async function addBookToDataBase(req: Request, res: Response) {
    try {
        let titleToAdd = req.body.title;
        let authorsToAdd = [req.body.author1, req.body.author2, req.body.author3];

        let addAuthor = fs.readFileSync('sqlScripts/add_author.sql', 'utf8');
        let addBookData = fs.readFileSync('sqlScripts/add_book_data.sql', 'utf8');
        let addNextAuthorIDAndBookId = fs.readFileSync('sqlScripts/add_next_authorID_and_bookID.sql', 'utf8');

        await pool.query(addBookData, titleToAdd);
        for (let author of authorsToAdd) {
            if (author) {
                await pool.query(addAuthor, author);
                await pool.query(addNextAuthorIDAndBookId);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(501).send({
            error: "The request was not completed. The server did not support the functionality required."
        });
    }
}

/**
 * In accordance with the received data from the request, 
 * it receives data about books from the database and sends it in the response.
 * 
 * @param req Client request. Must contain offset and limit in querystring.
 * @param res Server response with book information in json form.
 */
async function sendBookStatistic(req: Request, res: Response) {
    try {
        let getBooks = fs.readFileSync('sqlScripts/get_books.sql', 'utf8');
        let offset = Number(req.query.offset);
        let limit = Number(req.query.limit);
        let [books] = await pool.query<RowDataPacket[]>(getBooks);
        let result = {
            'success': true,
            'data': {
                'books': books.slice(offset, offset + limit),
                'total': {
                    'amount': books.length
                }
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
 * Checks whether the received login and password match the data from the database. 
 * In accordance with the comparison result, sends a response to the client.
 * 
 * @param req Client request. The body of the request must contain the username and password.
 * @param res Server response. Data in the form of json that informs the user about the authorization result.
 */
async function login(req: Request, res: Response) {
    try {
        let inputedLogin = req.body.login;
        let inputedPassword = req.body.pass;

        let getPassword = fs.readFileSync('sqlScripts/get_login_and_password.sql', 'utf8');
        let [[adminData]] = await pool.query<RowDataPacket[]>(getPassword, [inputedLogin]);
        let password = adminData.password;

        if (password) {
            let arePasswordsMatched = await bcrypt.compare(inputedPassword, password);
            if (arePasswordsMatched) {
                req.session.login = adminData.login;
                let result = {
                    'authorization': true
                }
                res.send(result);
            } else {
                let result = {
                    'authorization': false
                }
                res.send(result);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: `The request was not completed. The server met an unexpected condition.`
        });
    }
}

/**
 * Checks the correspondence of the login obtained from the arguments with the data from the database.
 * 
 * @param req A client request containing a login in the body.
 * @param res Server response. 
 * @returns True, if a login match is found, otherwise - false.
 */
async function authorized(req: Request, res: Response) {
    try {
        let inputedLogin = req.body.login;

        let getPassword = fs.readFileSync('sqlScripts/get_login_and_password.sql', 'utf8');
        let [[adminData]] = await pool.query<RowDataPacket[]>(getPassword, [inputedLogin]);

        if (req.session.login === adminData.login) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: `The request was not completed. The server met an unexpected condition.`
        });
    }
}

/**
 * Sends an uthorization page template to the client.
 * 
 * @param req Client request.
 * @param res Server response.
 */
function sendAuthorizationTemplate(req: Request, res: Response) {
    try {
        let authorizationTemplate = fs.readFileSync('front/basic auth/index.html', 'utf-8');
        res.send(authorizationTemplate);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

/**
 * Sends an admin page to the client.
 * 
 * @param req Client request.
 * @param res Server response.
 */
function sendAdminTemplate(req: Request, res: Response) {
    try {
        let adminTemplate = fs.readFileSync('front/admin/admin.html', 'utf-8');
        res.send(adminTemplate);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "The request was not completed. The server met an unexpected condition."
        });
    }
}

module.exports = admin;