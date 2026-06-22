import fs from 'fs';
import pdf from 'pdf-parse';

const filePath = 'c:/Users/BHUVANESH D/OneDrive/Desktop/learning_path/sample_datascience.pdf';
const dataBuffer = fs.readFileSync(filePath);

const pages = [];

function render_page(pageData) {
  return pageData.getTextContent()
    .then(function(textContent) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      
      const pageNum = pageData.pageIndex !== undefined ? pageData.pageIndex + 1 : pages.length + 1;
      
      pages.push({
        pageNumber: pageNum,
        text: text
      });
      
      return text;
    });
}

pdf(dataBuffer, { pagerender: render_page })
  .then(data => {
    console.log('Total Pages parsed:', data.numpages);
    console.log('Pages array length:', pages.length);
    pages.forEach(p => {
      console.log(`\n--- Page ${p.pageNumber} ---`);
      console.log(p.text.substring(0, 150));
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
