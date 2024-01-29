var drawItemsOnScroll,
    loadData,
    isScrollRunning = false,
    searchedTitle;
// console.log(isScrollRunning);

$(loadData());

function loadData() {
    console.log('loadData');
    (function () {

        data = {
            filter: getParameterByName('filter') || "new",
            offset: getParameterByName('offset') || 0,
            limit: getParameterByName('count') || global.items_limit_on_page_load
        };

        setSidebarActiveButton(null, data.filter);
        doAjaxQuery('GET', '/api/v1/books', data, function (res) {
            // console.log('qindex');
            view.addBooksItems(res.data.books, true);
            drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
            if (localStorage.getItem('h')) {
                $(window).scrollTop(localStorage.getItem('h'));
                localStorage.removeItem('h');
            }
        });
    }());

    $('#content').on('click', '.book', function () {
        localStorage.setItem('h', $(window).scrollTop());
    });

    $(document).on('scroll', function () {
        if ((($(document).height() - $(window).scrollTop()) < (2 * $(window).height())) && !isScrollRunning) {
            isScrollRunning = true;
            drawItemsOnScroll();
        }
    });
}

/**
 * 
 */
$('#pagination').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 200, function () {
        localStorage.setItem('h', $(window).scrollTop());
        view.setButtonCollapse(false);
        isScrollRunning = false;
        if (searchedTitle) {
            return searchBooks(searchedTitle);
        }
        // loadData();
    });
});

/**
 * Searches for books by title, sending a request to the server.
 * 
 * @param {string} textOfTitle Part of the book's title.
 */
function searchBooks(textOfTitle) {
    let data = {
        text: textOfTitle,
        filter: getParameterByName('filter') || "new",
        offset: getParameterByName('offset') || 0,
        limit: getParameterByName('count') || global.items_limit_on_page_load
    }
    searchedTitle = textOfTitle;
    isScrollRunning = true;
    drawItemsOnScroll();
    doAjaxQuery('GET', '/search', data, function (res) {
        console.log(res.data.books);
        view.addBooksItems(res.data.books, true);
        drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
    })
}

function getParameterByName(name, url) {
    if (!url) url = $(location).attr('href');
    // console.log(url);
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var initDrawItemsOnScroll = function (maxItems) {
    console.log('initDrawItemsOnScroll');
    var maxNumOfItems = maxItems,
        offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load,
        limit = global.number_of_items_onscroll;

    return function () {
        if (offset < maxNumOfItems) {
            var data = {
                'filter': getParameterByName('filter') || "new",
                'offset': offset,
                'limit': limit
            };
            $("#loading").slideDown();
            doAjaxQuery('GET', '/api/v1/books', data,
                function (res) {
                    $("#loading").slideUp();
                    isScrollRunning = false;
                    view.addBooksItems(res.data.books, false);
                    // changeHistoryStateWithParams("replace", res.data.filter, res.data.offset);
                });
            offset += limit;
            view.setButtonCollapse(false);
        } else {
            console.log('maxNumOfItems', maxNumOfItems);
            if (maxNumOfItems > limit) {
                view.setButtonCollapse(true);
            } else {
                view.setButtonCollapse(false);
            }
        }
    }
};

function loadIndexPage(reqData) {
    doAjaxQuery('GET', '/api/v1/books', reqData, function (res) {
        view.addBooksItems(res.data.books, true);
        changeHistoryStateWithParams('push', res.data.filter, res.data.offset);
        drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
    });
}

function setSidebarActiveButton(activeElem, filterStringValue) {
    $('.sidebar_item').removeClass('active');
    if (activeElem) {
        activeElem.closest('a').addClass('active');
        return;
    } else {
        $('a[data-filter=' + filterStringValue + ']').addClass('active');
    }
}
