// Open the database
const request = indexedDB.open("MyTestDatabase", 1);

// Handle upgrade (schema creation) if needed
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id" });
    }
};

// Handle successful opening
request.onsuccess = (event) => {
    const db = request.result;
    console.log("Database opened successfully");

    // Add dummy data
    const transaction = db.transaction("books", "readwrite");
    const booksStore = transaction.objectStore("books");

    const book1 = { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" };
    const book2 = { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" };

    booksStore.add(book1);
    booksStore.add(book2);

    // Read dummy data
    const readTransaction = db.transaction("books", "readonly");
    const readStore = readTransaction.objectStore("books");

    const getRequest1 = readStore.get(1);
    const getRequest2 = readStore.get(2);

    getRequest1.onsuccess = (e) => {
        const book = e.target.result;
        console.log("Book 1:", book);
    };

    getRequest2.onsuccess = (e) => {
        const book = e.target.result;
        console.log("Book 2:", book);
    };
};
