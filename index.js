const PDFLib = require('pdf-lib');
const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');

async function mergeAllDocuments(documentsBufferArray) {
    const pdfDoc = await PDFLib.PDFDocument.create();
    const numDocs = documentsBufferArray.length;

    for(var i = 0; i < numDocs; i++) {
        const donorPdfDoc = await PDFLib.PDFDocument.load(documentsBufferArray[i]);
        const docLength = donorPdfDoc.getPageCount();
        for(var k = 0; k < docLength; k++) {
            const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
            pdfDoc.addPage(donorPage);
        }
    }

    pdfDoc.save().then((donorPdfBytes) => {
        fs.writeFile('out.pdf', donorPdfBytes, (e) => {
            if (e) {
                console.log(e);
            }
            else {
                console.log("Merging Done");
                console.timeEnd("MergeTime");
                console.log("File Saved to out.pdf");
                console.timeEnd("TotalTime");
            }
        });
    });
}

function fetchFileBuffer(url) {
    return new Promise((resolve, reject) => {
        fetch(url).then(res => resolve(res.arrayBuffer()));
    });
}

function main() {
    console.log("Fetch Started");
    console.time("FetchTime");
    var rd = readline.createInterface({
        input: fs.createReadStream('input.txt'),
        console: false
    });

    var urls = [];

    rd.on('line', function(line) {
        urls = [...urls, line];
    });

    rd.on('close', () => {
        Promise.all(urls.map(fetchFileBuffer)).then((bufferArray) => {
            console.log("Fetching Done");
            console.timeEnd("FetchTime");
            console.log("Merging Started");
            console.time("MergeTime");
            mergeAllDocuments(bufferArray);
        });
    });
}


console.time("TotalTime");
main();