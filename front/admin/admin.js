let books,
    currentPage,
    offset = 0,
    limit = 4,
    paginationFirstNumber,
    paginationLastNumber,
    pagePaginationButtonsMaxAmount = 3,
    paginationButtonMinValue = 1,
    booksOnThePage = 4;

$(() => {
    (function () {
        let data = {
            'offset': offset,
            'limit': limit
        }
        doAjaxQuery('GET', '/admin/api/v1/', data, (res) => {
            let booksTotal = res.data.total.amount;
            if (booksTotal > 0) currentPage = paginationButtonMinValue;
            paginationFirstNumber = getPaginationFirstNumber(currentPage, booksTotal);
            paginationLastNumber = getPaginationLastNumber(currentPage, booksTotal);
            books = res.data.books;
            view.addBooksToTable(books);
            view.setPagination(res.data.total.amount, paginationFirstNumber, paginationLastNumber);
            changeButtonStyle(`button${currentPage}`);
        })
    }());
});

function deleteBook(id, bookStatus) {
    let data = {
        'id': id
    }
    doAjaxQuery('PUT', '/admin/api/v1/', JSON.stringify(data), (res) => {
        view.changeTextDeleteLink(res.data.id, res.data.bookStatus);
    })
}

function changeButtonStyle(clickedButtonId) {
    let buttons = document.getElementsByTagName('button');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('clicked');
    }

    var clickedButton = document.getElementById(clickedButtonId);
    clickedButton.classList.add('clicked');
}

function getPaginationLastNumber(currentPage, booksTotal) {
    // if (currentPage * booksOnThePage + booksOnThePage * pagePaginationButtonsMaxAmount <= booksTotal) {
    //     return currentPage + pagePaginationButtonsMaxAmount - paginationButtonMinValue;
    // }
    // for (let pageOffset = 0; pageOffset <= pagePaginationButtonsMaxAmount; pageOffset++) {
    //     if (booksTotal <= currentPage * booksOnThePage + booksOnThePage * pageOffset) {
    //         return currentPage + pageOffset;
    //     }
    // };
    if (currentPage % pagePaginationButtonsMaxAmount === 1) {
        if (booksTotal <= currentPage * booksOnThePage) return currentPage;
        if (booksTotal > currentPage * booksOnThePage &&
            booksTotal <= currentPage * booksOnThePage + booksOnThePage) return currentPage + 1;
        if (booksTotal > currentPage * booksOnThePage + booksOnThePage) return currentPage + 2;
    }
    if (currentPage % pagePaginationButtonsMaxAmount === 2) {
        if (booksTotal <= currentPage * booksOnThePage) return currentPage;
        if (booksTotal > currentPage * booksOnThePage &&
            booksTotal <= currentPage * booksOnThePage + booksOnThePage) return currentPage + 1;
    }
    return currentPage;
}

function getPaginationFirstNumber(currentPage, booksTotal) {
    if (currentPage % pagePaginationButtonsMaxAmount > 0) {
        return currentPage - (currentPage % pagePaginationButtonsMaxAmount - paginationButtonMinValue);
    };
    return currentPage - pagePaginationButtonsMaxAmount + paginationButtonMinValue;
    // if (currentPage % pagePaginationButtonsMaxAmount === 1) return currentPage;
    // if (currentPage % pagePaginationButtonsMaxAmount === 2) return currentPage - 1;
    // if (currentPage % pagePaginationButtonsMaxAmount === 0) return currentPage - 2;
}

function addBookToDataBase() {
    console.log('addBookToDataBase');
    let formData = new FormData(document.getElementById('form_for_adding_book'));
    let data = {
        'title': formData.get('title'),
        'author1': formData.get('author1'),
        'author2': formData.get('author2'),
        'author3': formData.get('author3'),
        'file': formData
    }
    doAjaxQuery('POST', '/admin/api/v1', data, function (res) {

        // console.log('currentPage: ', currentPage);
        // console.log('paginationFirstNumber: ', paginationFirstNumber);
        // console.log('paginationLastNumber: ', paginationLastNumber);
        // console.log('offset: ', offset);

        let booksTotal = res.data.total.amount;
        paginationFirstNumber = getPaginationFirstNumber(currentPage, booksTotal);
        paginationLastNumber = getPaginationLastNumber(currentPage, booksTotal);
        books = res.data.books;
        view.addBooksToTable(books);
        view.setPagination(res.data.total.amount, paginationFirstNumber, paginationLastNumber);
        goToPage(currentPage);
    })
}

function previewImage() {
    let input = document.getElementById('fileInput');
    let preview = document.getElementById('image-preview');

    let file = input.files[0];

    if (file) {
        let reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
        };

        reader.readAsDataURL(file);
    } else {
        preview.src = '#';
    }
}

function goToPage(num) {
    currentPage = num;
    offset = --num * limit;
    let data = {
        'limit': limit,
        'offset': offset
    }
    doAjaxQuery('GET', '/admin/api/v1', data, (res) => {
        books = res.data.books;
        view.addBooksToTable(books);
    });
    changeButtonStyle(`button${currentPage}`);
}

function goToNextPages() {
    currentPage = getCurrentPageOfTheNextPagination();
    offset = limit * currentPage - limit;
    let data = {
        'limit': limit,
        'offset': offset
    }
    doAjaxQuery('GET', '/admin/api/v1', data, (res) => {
        let booksTotal = res.data.total.amount;
        paginationFirstNumber = getPaginationFirstNumber(currentPage, booksTotal);
        paginationLastNumber = getPaginationLastNumber(currentPage, booksTotal);

        // console.log('currentPage: ', currentPage);
        // console.log('paginationFirstNumber: ', paginationFirstNumber);
        // console.log('paginationLastNumber: ', paginationLastNumber);
        // console.log('offset: ', offset);

        books = res.data.books;
        view.addBooksToTable(books);
        view.setPagination(res.data.total.amount, paginationFirstNumber, paginationLastNumber);
        changeButtonStyle(`button${currentPage}`);
    });
}

function getCurrentPageOfTheNextPagination() {
    if (currentPage % pagePaginationButtonsMaxAmount === 0) {
        return currentPage + paginationButtonMinValue;
    }
    if (currentPage % pagePaginationButtonsMaxAmount === 1) {
        return currentPage + pagePaginationButtonsMaxAmount;
    }
    if (currentPage % pagePaginationButtonsMaxAmount === 2) {
        return currentPage + 2;
    }
}

function goToPreviousPages() {
    currentPage = getCurrentPageOfThePreviousPagination();
    offset = limit * currentPage - limit;
    let data = {
        'limit': limit,
        'offset': offset
    }
    doAjaxQuery('GET', '/admin/api/v1', data, (res) => {
        let booksTotal = res.data.total.amount;
        console.log(booksTotal);
        paginationFirstNumber = getPaginationFirstNumber(currentPage, booksTotal);
        paginationLastNumber = getPaginationLastNumber(currentPage, booksTotal);

        // console.log('currentPage: ', currentPage);
        // console.log('paginationFirstNumber: ', paginationFirstNumber);
        // console.log('paginationLastNumber: ', paginationLastNumber);
        // console.log('offset: ', offset);

        books = res.data.books;
        view.addBooksToTable(books);
        view.setPagination(res.data.total.amount, paginationFirstNumber, paginationLastNumber);
        changeButtonStyle(`button${currentPage}`);
    });
}

function getCurrentPageOfThePreviousPagination() {
    if (currentPage % pagePaginationButtonsMaxAmount === 0) {
        return currentPage - pagePaginationButtonsMaxAmount - 2;
    }
    if (currentPage % pagePaginationButtonsMaxAmount === 1) {
        return currentPage - pagePaginationButtonsMaxAmount;
    }
    if (currentPage % pagePaginationButtonsMaxAmount === 2) {
        return currentPage - pagePaginationButtonsMaxAmount - paginationButtonMinValue;
    }
}

function submitForm () {
    console.log('submitForm: ');
    var formData = new FormData();
    var fileInput = document.getElementById('image');

    var fileInput = document.getElementById('form_for_adding_book').elements['image'];

    if (fileInput && fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0], fileInput.files[0].name);
    }

    let iputtedTitle = $('#titleInput').val();
    let inputtedAuthor1 = $('#author1').val();
    let inputtedAuthor2 = $('#author2').val();
    let inputtedAuthor3 = $('#author3').val();

    formData.append('title', iputtedTitle);
    formData.append('author1', inputtedAuthor1);
    formData.append('author2', inputtedAuthor2);
    formData.append('author3', inputtedAuthor3);
    formData.append('offset', offset);
    formData.append('limit', limit);

    fetch('/admin/api/v1', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(res => {
        let booksTotal = res.data.total.amount;
        paginationFirstNumber = getPaginationFirstNumber(currentPage, booksTotal);
        paginationLastNumber = getPaginationLastNumber(currentPage, booksTotal);
        books = res.data.books;
        view.addBooksToTable(books);
        view.setPagination(res.data.total.amount, paginationFirstNumber, paginationLastNumber);
        goToPage(currentPage);
        console.log('Ответ от сервера:', res);
    })
    .catch(error => {
        console.log(error);
    });
}