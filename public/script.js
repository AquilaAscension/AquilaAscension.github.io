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
