window.onload = () => {

    let btnCrop, imageUploader, piecesraw, output, image, width, height, chunk, pieces, dlall, imgname;
    btnCrop = document.querySelector("#btnCrop");
    imageUploader = document.querySelector("#source");
    piecesraw = document.querySelector("#pieces");
    output = document.querySelector("#output");
    dlall = document.querySelector("#downloadAll");
    dlall.style.display = "none";

    imageUploader.onchange = function(event) {
        const filelist = event.target.files;
        let reader = new FileReader();
        imgname = (filelist[0].name).replace(`.${(filelist[0].type).replace("image/", "")}`, "");
        console.log(imgname);
        reader.readAsDataURL(filelist[0]);
        image = new Image();

        reader.onload = function () {
            image.src = reader.result;
            
            image.onload = function() {
                width = this.width;
                height = this.height;
            }
        }

        btnCrop.onclick = function(){
            if (!width || piecesraw.value == "") return;
            
            pieces = piecesraw.value;
            chunk = Math.floor(width / pieces);
            console.log(`Pieces: ${pieces}. Chunks: ${chunk} (${width} / ${pieces})`);

            for(let i = 0; i < pieces; i++) {
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                console.log(`Making ${pieces} pieces the size of ${chunk}px each on ${canvas} using ${context}.`);
                canvas.width = chunk * 1.05;
                canvas.height = height;
                context.drawImage(image, i * chunk, 0, chunk, height, 0, 0, chunk, height);
                output.appendChild(canvas);
            }

            dlall.style.display = "block";
        }
    }

    dlall.onclick = function() {
        let canvases = output.children;
        for(let i = 0; i < canvases.length; i++)
        {
            let fileName = imgname + "(" + i + ")";

            let blob = canvases[i].toDataURL();

            let a = document.createElement("a");
            a.title = fileName;
            a.href = blob;
            a.style.display = "none";
            a.setAttribute("download", fileName);
            a.setAttribute("target", "_blank");
            
            document.body.appendChild(a);

            a.click();
        }
    }
}