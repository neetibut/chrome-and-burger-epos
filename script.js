// using the DOMContentLoaded event to ensure
// the script runs after the DOM is fully loaded
// Web pages that load content dynamically based
// on user interactions need to ensure that the
// initial DOM structure is ready before running
// JavaScript.
document.addEventListener("DOMContentLoaded", () => {
  // products array
  const products = [
    { id: 1, name: "Product A", price: 20 },
    { id: 2, name: "Product B", price: 30 },
    { id: 3, name: "Product C", price: 40 },
  ];

  // create an empty named cart
  const cart = [];

  // create an empty array named transactions
  let transactions = [];

  // assigning html elements by Id
  const productsContainer = document.getElementById("products");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart");
  const checkoutButton = document.getElementById("checkout");
  const transactionsContainer = document.getElementById("transactions");

  // function to create and append div element for each product item
  // including the product details and buttons with event listeners for
  // adding the product to the cart
  function addProductToDOM(product) {
    const productDiv = document.createElement("div");
    productDiv.className =
      "p-4 bg-white rounded shadow-lg flex flex-col items-center justify-center";
    productDiv.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${product.name}</h3>
            <p class="mb-2">$${product.price}</p>
            <input type="number" value="1" min="1" id="qty-${product.id}" class="mb-2 w-16 text-center border rounded">
            <div class="flex space-x-2">
                <button class="add-single px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 cursor-pointer">Add 1 to Cart</button>
                <button class="add-multiple px-4 py-2 bg-blue-700 text-white font-bold rounded hover:bg-blue-800 cursor-pointer">Add Multiple to Cart</button>
            </div>
        `;
    productDiv
      .querySelector(".add-single")
      .addEventListener("click", () => addToCart(product.id, false));
    productDiv
      .querySelector(".add-multiple")
      .addEventListener("click", () => addToCart(product.id, true));
    productsContainer.appendChild(productDiv);
  }
  // function to update the cart when new items and quantities are added
  function updateCart() {
    cartItemsEl.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
      cartItemsEl.appendChild(li);
    });
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cartTotalEl.textContent = `Total: $${total}`;
  }
  // function to add product item to card
  function addToCart(productId, isMultiple) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = isMultiple ? parseInt(quantityInput.value) : 1;
    const product = products.find((p) => p.id === productId);
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity: quantity });
    }
    updateCart();
  }
  // function to clear cart items
  function clearCart() {
    cart.length = 0;
    updateCart();
  }
  // function to confirm transaction to record
  function checkout() {
    const transactionId = Date.now();
    const date = new Date().toISOString();
    const orderDetails = cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    }));
    const grandTotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const transaction = { transactionId, date, orderDetails, grandTotal };
    transactions.push(transaction);
    displayTransaction(transaction);
    clearCart();
  }
  // function to display transaction
  function displayTransaction(transaction) {
    const transactionDiv = document.createElement("div");
    transactionDiv.className = "mb-4 p-2 border border-gray-300 rounded";
    transactionDiv.innerHTML = `
            <h4 class="font-bold">Transaction ID: ${
              transaction.transactionId
            }</h4>
            <p>Date: ${transaction.date}</p>
            <ul>
                ${transaction.orderDetails
                  .map(
                    (item) => `
                    <li>${item.name} - ${item.quantity} x $${item.unitPrice} = $${item.totalPrice}</li>
                `
                  )
                  .join("")}
            </ul>
            <p class="font-bold">Grand Total: $${transaction.grandTotal}</p>
        `;
    const editButton = document.createElement("button");
    editButton.textContent = "Edit Transaction";
    editButton.className =
      "px-4 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-700 cursor-pointer";
    editButton.addEventListener("click", () =>
      editTransaction(transaction.transactionId)
    );
    transactionDiv.appendChild(editButton);
    transactionsContainer.appendChild(transactionDiv);
  }
  // function to edit transaction details
  function editTransaction(transactionId) {
    const transaction = transactions.find(
      (t) => t.transactionId === transactionId
    );
    if (!transaction) {
      alert("Transaction not found.");
      return;
    }

    // Providing a more detailed instruction in the prompt.
    const promptMessage = `Edit quantities for Transaction ID ${transactionId}. Enter changes in the format: "ProductName, NewQuantity; ProductName, NewQuantity;"\nExample: Product A, 2; Product B, 5;`;
    const userInput = prompt(
      promptMessage,
      transaction.orderDetails
        .map((item) => `${item.name}, ${item.quantity};`)
        .join(" ")
    );

    if (!userInput) return; // User cancelled the prompt

    try {
      const entries = userInput
        .split(";")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      const updatedDetails = entries.map((entry) => {
        const parts = entry.split(",").map((p) => p.trim());
        if (parts.length !== 2 || isNaN(parseInt(parts[1]))) {
          throw new Error("Invalid entry format");
        }
        return { name: parts[0], quantity: Math.max(1, parseInt(parts[1])) };
      });

      transaction.orderDetails.forEach((item) => {
        const updatedItem = updatedDetails.find((u) => u.name === item.name);
        if (updatedItem && updatedItem.quantity >= 0) {
          item.quantity = updatedItem.quantity; // Update quantity
        }
      });

      transaction.grandTotal = transaction.orderDetails.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );
      displayTransactions(); // Refresh the display of transactions
    } catch (error) {
      alert(
        `Error: ${error.message}. Please try again with the correct format.`
      );
    }
  }
  // function to display transactions record
  function displayTransactions() {
    transactionsContainer.innerHTML = "";
    transactions.forEach((transaction) => displayTransaction(transaction));
  }

  // for every product in the products array add the product to the DOM
  products.forEach((product) => addProductToDOM(product));

  // Multiple Event Listeners
  clearCartButton.addEventListener("click", clearCart);
  checkoutButton.addEventListener("click", checkout);
});
