var booksList = [];

document.getElementById("form-search").addEventListener("submit", function(evt)
{
    evt.preventDefault();
    const keyworkds = document.getElementById('keywords').value;
    queryGoogleBook(keyworkds,true);
});



function queryGoogleBook(keywords,reset)
{
    if(keywords == ""){keywords = "stoic";}
    let queryText = `https://www.googleapis.com/books/v1/volumes?q=${keywords}&key=AIzaSyC-NoSWtoOfk4H8R2RFEga3kpM4lcbB_s0`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', queryText, true);
    xhr.onload = function ()
    {
        if (this.status == 200 && isDefined(this.responseText)) 
        {
            let returnData = JSON.parse(this.responseText);
            if(returnData.totalItems > 0)
            {
                if(reset){Storage.reset();}
                let books = returnData.items;
                books.forEach((googleBook) => {
                    const book = Book.fromGoogleBookToBook(googleBook);
                    Storage.addBook(book);
                }) 
                console.log(booksList);
                UI.printBooksList();
            }
            else
            {
               UI.printAlert('No book found', 'danger');
            }
            
        }
        else
        {
           UI.printAlert('No book found', 'danger');
        }
    }
    xhr.send();
}


// Check if a field is correctly defined
function isDefined(test)
{
    if(typeof(test) == "undefined" || test == ""){ return false; }
    else { return true; }
}


//Where we store current book list
class Storage
{
    static reset()
    {
        booksList = [];
    }

    static addBook(book)
    {
        booksList.push(book);
    }
}


//Book class: reprensente un livre
class Book 
{
    constructor(googleID, title, subtitle, authors, isbn, rating, ratingsCount, publisher, publishedYear, cover, synopsis) 
    {
        this.googleID = googleID;
        this.title = title;
        this.subtitle = subtitle;
        this.authors = authors;
        this.isbn = isbn;
        this.rating = rating;
        this.ratingsCount = ratingsCount;
        this.publisher = publisher;
        this.publishedYear = publishedYear;
        this.cover = cover;
        this.synopsis = synopsis;
    }

    static fromGoogleBookToBook(googleBook)
    {
        //Define Title 
        let title = googleBook.volumeInfo.title;
        if(!isDefined(title)){ return;}

        //Define cover
        try{var cover = googleBook.volumeInfo.imageLinks.thumbnail;}
        catch{ var cover = "no_book_cover.png"; }

        //Define Sutitle
        let subtitle = googleBook.volumeInfo.subtitle;
        if(!isDefined(subtitle)) {subtitle ="";}
        else {subtitle = " | " + subtitle;}
       
        //Define authors
        let authorsInfo = googleBook.volumeInfo.authors;
        let authors = "";
        try
        {
            authorsInfo.forEach((val, i, array) =>
            {
                authors += val;  
                if (array.length - 1 != i){authors += ", ";}                   
            });
        }
        catch{authors = "Unknown author"}

        //Define Publisher infos
        let publisher = googleBook.volumeInfo.publisher;
        if(!isDefined(publisher)) {publisher ="Unknown publisher";}

        //Define Published year
        let publishedYear = googleBook.volumeInfo.publishedDate
        if(!isDefined(publishedYear)) {publishedYear ="Unknown date of publication";}
        else {publishedYear = publishedYear.slice(0,4)}

        //Define synopsis
        let synopsis = googleBook.volumeInfo.description;
        if(!isDefined(synopsis)){synopsis = "Synopsis not available." }  

        //Define rating count
        let ratingsCount = googleBook.volumeInfo.ratingsCount;
        if(!isDefined(ratingsCount)){ratingsCount = "0"; }

        //Define rating 
        let rating = googleBook.volumeInfo.averageRating;
        if(!isDefined(rating)){rating = "Rating not available."; }

        const book = new Book('No ID', title, subtitle, authors, 'No ISBN', rating, ratingsCount, publisher, publishedYear, cover, synopsis); 
        return book;
    }
}

class UI
{
    static printBooksList()
    {
        const booksContainer = document.getElementById("booksContainer");
        booksContainer.innerHTML = "";
        booksList.forEach((book) => {
            
            //Convert Rating to html
            let ratingHTML = "";
            if(book.rating != "Rating not available.")
            {
                for (let i = 1; i < 6; i++) 
                {
                    if (i <= book.rating) 
                    {
                        ratingHTML += '<span class="fas fa-star"></span>';
                    }
                    else
                    {
                        ratingHTML += '<span class="far fa-star "></span>';
                    }
                }
            }
            else
            {
                ratingHTML = book.rating;
            }

            //Génération des tables HTML. Une table par book.
            booksContainer.innerHTML += `
            <table class="table table-light table-borderless my-3 p-2" >
                <tr>
                    <td class="text-justify">
                            <h3>${book.title}<small class="text-muted">${book.subtitle}</small></h3>     
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="badge rounded-pill bg-secondary"><div title="${book.ratingsCount} ratings">${ratingHTML}</div></span>
                        <span class="badge rounded-pill bg-secondary">${book.authors}</span>
                        <span class="badge rounded-pill bg-secondary">${book.publisher}</span>
                        <span class="badge rounded-pill bg-secondary">${book.publishedYear}</span>
                    </td>  
                </tr>
                <tr>
                    <td>
                        <table>
                            <tr class="align-top">
                                <td class="px-2"> 
                                    <img src="${book.cover}" alt="No cover available."> 
                                </td>
                                <td class="text-justify px-2" style="
                                    overflow: hidden; 
                                    text-overflow: ellipsis; 
                                    display: -webkit-box;
                                             -webkit-line-clamp: 9; /* number of lines to show */
                                                     line-clamp: 9; 
                                            -webkit-box-orient: vertical;">
                                        ${book.synopsis}
                                </td>
                            </tr>
                        </table>
                        
                    </td>
                </tr>
            </table>`;
        }); 
    }

    static printAlert(message, color)
    {
        //create div alert
        const div = document.createElement('div');
        div.className = `alert alert-${color}`;
        div.appendChild(document.createTextNode(message));

        //insert div alert
        const element = document.getElementById("alertLocation");
        element.appendChild(div);

        //autodelete  div alerte
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }
}