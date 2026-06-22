from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Full Stack Web Development and Database Systems', border=False, align='C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Page 1: Introduction to Web Development
pdf.add_page()
pdf.set_font('helvetica', '', 12)
pdf.multi_cell(0, 10, "Introduction to Web Development.\n\nWeb development is the work involved in developing a website for the Internet or an Intranet. This includes web markup, coding, client-side scripting, and server-side configurations. Modern applications use HTML for structure and CSS for styling.\n\nWeb browsers parse these assets and construct the Document Object Model (DOM) to render the user interface. Responsive design ensures layouts scale correctly across devices.")

# Page 2: React.js and Frontend Frameworks
pdf.add_page()
pdf.multi_cell(0, 10, "React.js and Frontend Frameworks.\n\nReact is a popular open-source JavaScript library for building user interfaces, particularly single-page applications. It is maintained by Meta and a community of developers.\n\nReact allows developers to create reusable UI components. It uses a Virtual DOM to optimize updates and rendering performance, ensuring that only modified parts of the page are updated, rather than re-rendering the entire page. Components can manage internal state using hooks.")

# Page 3: Vite Build Tool
pdf.add_page()
pdf.multi_cell(0, 10, "Vite Build Tool.\n\nVite is a modern frontend build tool that is extremely fast. It serves code via native ES modules during development and bundles assets with Rollup for production.\n\nVite provides fast Hot Module Replacement (HMR) out of the box, meaning code changes are instantly reflected in the browser without reloading the page or losing current application state.")

# Page 4: Node.js and Server-Side Javascript
pdf.add_page()
pdf.multi_cell(0, 10, "Node.js and Server-Side Javascript.\n\nNode.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. It allows developers to use JavaScript to write command line tools and for server-side scripting.\n\nNode.js uses an asynchronous event-driven model, making it lightweight and efficient for building scalable network applications, handling thousands of concurrent connections.")

# Page 5: Express.js REST APIs
pdf.add_page()
pdf.multi_cell(0, 10, "Express.js REST APIs.\n\nExpress is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies building web servers and APIs.\n\nExpress handles routing, middleware integration, request parameters, and HTTP responses. It is widely used to build RESTful APIs, which communicate using standard HTTP methods like GET, POST, PUT, and DELETE.")

# Page 6: MongoDB Database and Mongoose ODM
pdf.add_page()
pdf.multi_cell(0, 10, "MongoDB Database and Mongoose ODM.\n\nMongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas.\n\nMongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and is used to translate between code objects and database documents.")

pdf.output('test_custom_course.pdf')
print("Successfully generated test_custom_course.pdf")
