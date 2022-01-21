window.onload = () => {

    //initialising all variables needed globally
    let btnCrop, piecesraw, output, dlall, auto, preview;
    let img = {};
    //img object will contain:
    //  uploader: the actual file input for the image
    //  image: the image that i will use to draw with canvas
    //  width: the width of the image
    //  height: the height of the image
    //  name: the filename of the image (without extension)
    //  pieces: how many pieces or chunks the image should be split into
    //  chunk: the actual width of each piece

    img.uploader = document.querySelector("#source");
    btnCrop = document.querySelector("#btnCrop");
    piecesraw = document.querySelector("#pieces");
    
    auto = document.querySelector("#square");

    preview = document.querySelector("#preview");
    output = document.querySelector("#output");

    dlall = document.querySelector("#downloadAll");
    dlall.style.display = "none";

    if (auto.checked) piecesraw.setAttribute("disabled", ""); 
    else piecesraw.removeAttribute("disabled");

    //when image is selected
    img.uploader.onchange = function(event) {
        //get the list of files selected
        const filelist = event.target.files;
        let reader = new FileReader();

        //translate the file name from Example.png to Example with regex
        // Regex translation: 
        // \. Match literal dot
        // [^/.] Any character not in this set (so anything thats not a . or /)
        // + Match 1 or more of the previous character
        // $ End of string
        img.name = filelist[0].name.replace(/\.[^/.]+$/, "");

        //console.log(img.name);

        //encode image in base64
        reader.readAsDataURL(filelist[0]);

        img.image = new Image();

        //when image is done being encoded
        reader.onload = function () 
        {
            img.image.src = reader.result;
            
            //once image is done loading
            img.image.onload = function() 
            {
                //set size of image in img object for reference later
                img.width = this.width;
                img.height = this.height;

                //this just calculates how many pieces the image should be split into to make the most square pieces possible with basic math
                calculatePieces(img, auto, piecesraw);

                //clear preview area
                preview.innerHTML = "";

                //create canvas + draw image as a preview
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img.image, 0, 0);
                preview.appendChild(canvas);
            }
        }

        //this is where the magic happens
        btnCrop.onclick = function(){
            //if there is no img.width, image hasn't loaded yet
            if (!img.width || piecesraw.value == "") return;
            
            //clear output (to prevent old images from still being shown)
            output.innerHTML = "";

            //create a new canvas image for each piece required 
            //(if set to auto, a 400x100 image would have 4 pieces, to make 100x100 each)
            for(let i = 0; i < img.pieces; i++) {
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                console.log(`Making ${img.pieces} pieces the size of ${img.chunk}px each on ${canvas} using ${context}.`);

                //this is the canvas width not image width
                canvas.width = img.chunk;
                canvas.height = img.height;

                //This is what I use to crop the image. it goes 
                // (image, startX, startY, imagewidth, imgheight, X, Y, W, H)
                context.drawImage(img.image, i * img.chunk, 0, img.chunk, img.height, 0, 0, img.chunk, img.height);

                //add the image to my output div
                output.appendChild(canvas);
            }

            //make the download all button visible once i submit the image
            dlall.style.display = "block";
        }
    }

    //this is the auto checkbox
    auto.onchange = function(){
        if (auto.checked) piecesraw.setAttribute("disabled", ""); 
        else piecesraw.removeAttribute("disabled");
        if (!img.height) return true;
        calculatePieces(img, auto, piecesraw);
    }

    //when the download all button is clicked
    dlall.onclick = function() {
        //all of the canvases with "splits" of the image
        let canvases = output.children;

        for(let i = 0; i < canvases.length; i++)
        {
            //just creating a nice file name for downloading, denoted by numbers
            let fileName = img.name + "(" + i + ")";

            //create a URL to download the image
            let blob = canvases[i].toDataURL();

            //create a link
            let a = document.createElement("a");

            //set the download link attributes
            a.title = fileName;
            a.href = blob;

            //set to invisible
            a.style.display = "none";

            //set it so it opens on a new tab
            a.setAttribute("download", fileName);
            a.setAttribute("target", "_blank");
            
            //add to document
            document.body.appendChild(a);

            //download
            a.click();
        }
    }

    document.querySelector("#clear").onclick = function() {
        output.innerHTML = preview.innerHTML = piecesraw.value = "";
    }
}

//calculates how many pieces an image should be split into. Either manual or auto.
// manual: If image is 600px wide and user puts 3, it will be split into 3x 300px images
// auto: if image is 400px wide and 200px height, it will be split into 2x 200px * 200px images.
function calculatePieces(img, auto, piecesraw)
{
    if (auto.checked)
    {
        if(img.height > img.width) {
            piecesraw.value = img.pieces = 1;
        } else {
            img.pieces = Math.floor(img.width / img.height);
            piecesraw.value = img.pieces;
        }
    } else {
        img.pieces = piecesraw.value;
    }
    img.chunk = Math.floor(img.width / img.pieces);
}

