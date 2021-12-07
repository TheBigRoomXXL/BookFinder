
document.getElementById("form-search").addEventListener("submit", function(evt)
{
    evt.preventDefault();
    const keyworkds = document.getElementById('keywords').value;
    APIManagement.queryGoogleBook(keyworkds,true);
});

class APIManagement
{
    // Requete vers l'API Google Books
    static queryGoogleBook(keywords,replace)
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
                    let books = returnData.items; 
                    console.log(books)
                    UI.displayBooks(books,replace);
                }
                else
                {
                    UI.showAlert('No book found', 'danger');
                }
                
            }
            else
            {
                UI.showAlert('No book found', 'danger');
            }
        }
        xhr.send();
    }

}


function isDefined(test)
    {
        if(typeof(test) == "undefined" || test == ""){ return false; }
        else { return true; }
    }


// Gestion des visuels
class UI
{
    static displayBooks(books,replace)
    {
        const booksContainer = document.getElementById("booksContainer");
        if(replace){booksContainer.innerHTML ="";}
        books.forEach(book => 
        {
            //Define Title 
            let title = book.volumeInfo.title;
            if(!isDefined(title)){ return;}

            //Define cover
            try{var cover = book.volumeInfo.imageLinks.thumbnail;}
            catch{ var cover = "no_book_cover.png"; }

            //Define Sutitle
            let subtitle = book.volumeInfo.subtitle;
            if(!isDefined(subtitle)) {subtitle ="";}
            else {subtitle = " | " + subtitle;}
           
            //Define authors
            let authorsInfo = book.volumeInfo.authors;
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
            let publisher = book.volumeInfo.publisher;
            if(!isDefined(publisher)) {publisher ="Unknown publisher";}

            //Define Publisher infos
            let publishedYear = book.volumeInfo.publishedDate
            if(!isDefined(publishedYear)) {publishedYear ="Unknown date of publication";}
            else {publishedYear = publishedYear.slice(0,4)}

            //Define synopsis
            let synopsis = book.volumeInfo.description;
            if(!isDefined(synopsis)){synopsis = "Synopsis not available." }  

            //Define rating and rating count
            let ratingsCount = book.volumeInfo.ratingsCount;
            if(!isDefined(ratingsCount)){ratingsCount = "0"; }
            let averageRating = book.volumeInfo.averageRating;
            let rating = "";
            if(!isDefined(averageRating)){rating = "Rating not available."; }
            else
            {
                for (let i = 1; i < 6; i++) 
                {
                    if (i <= averageRating) 
                    {
                        rating += '<span class="fas fa-star"></span>';
                    }
                    else
                    {
                        rating += '<span class="far fa-star "></span>';
                    }
                }
            }

            //Génération des tables HTML. Une table par item.
            booksContainer.innerHTML += `
            <table class="table table-light table-borderless my-3 p-2" >
                <tr>
                    <td class="text-justify">
                            <h3>${title}<small class="text-muted">${subtitle}</small></h3>     
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="badge rounded-pill bg-secondary"><div title="${ratingsCount} ratings">${rating}</div></span>
                        <span class="badge rounded-pill bg-secondary">${authors}</span>
                        <span class="badge rounded-pill bg-secondary">${publisher}</span>
                        <span class="badge rounded-pill bg-secondary">${publishedYear}</span>
                    </td>  
                </tr>
                <tr>
                    <td>
                        <table>
                            <tr class="align-top">
                                <td class="px-2"> 
                                    <img src="${cover}" alt="No cover available."> 
                                </td>
                                <td class="text-justify px-2" style="
                                    overflow: hidden; 
                                    text-overflow: ellipsis; 
                                    display: -webkit-box;
                                             -webkit-line-clamp: 9; /* number of lines to show */
                                                     line-clamp: 9; 
                                            -webkit-box-orient: vertical;">
                                        ${synopsis}
                                </td>
                            </tr>
                        </table>
                        
                    </td>
                </tr>
            </table>`;
        }); 
    }

    static showAlert(message, color)
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