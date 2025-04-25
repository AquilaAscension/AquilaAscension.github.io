fetch("/drinks")
  .then((response) => response.json())
  .then((drinks) => {
    const list = document.getElementById("drinks-list");
    drinks.forEach((drink) => {
      const item = document.createElement("li");
      item.textContent = `${drink.Name} — $${drink.Price} (${drink.CurrentStock}/${drink.Capacity})`;
      list.appendChild(item);
    });
  })
  .catch((error) => {
    console.error("Error fetching drinks:", error);
  });

document.getElementById("add-drink-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const Name = document.getElementById("name").value;
  const Price = parseFloat(document.getElementById("price").value);
  const CurrentStock = parseInt(document.getElementById("current").value);
  const MinThreshold = parseInt(document.getElementById("min").value);
  const Capacity = parseInt(document.getElementById("capacity").value);

  fetch("/drinks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Name, Price, CurrentStock, MinThreshold, Capacity }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("form-message").textContent = "Drink added!";
      // Optionally: Refresh the drinks list
      setTimeout(() => location.reload(), 800);
    })
    .catch((err) => {
      console.error("Error adding drink:", err);
      document.getElementById("form-message").textContent =
        "Failed to add drink.";
    });
});
