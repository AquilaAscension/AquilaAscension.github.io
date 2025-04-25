function showSection(id) {
  document.querySelectorAll("section").forEach((sec) => {
    sec.style.display = sec.id === `${id}-section` ? "block" : "none";
  });
}

fetch("/drinks")
  .then((response) => response.json())
  .then((drinks) => {
    document.getElementById("total-drinks").textContent = drinks.length;
    const low = drinks.filter((d) => d.CurrentStock <= d.MinThreshold).length;
    document.getElementById("low-stock-count").textContent = low;

    const list = document.getElementById("drinks-list");
    list.innerHTML = ""; // Clear list before repopulating

    drinks.forEach((drink) => {
      const item = document.createElement("li");
      const isLow = drink.CurrentStock <= drink.MinThreshold;

      item.innerHTML = `
          <strong>${drink.Name}</strong> — $${drink.Price} 
          (${drink.CurrentStock}/${drink.Capacity})
          <button data-id="${drink.DrinkID}">🗑 Remove</button>
        `;

      if (isLow) {
        item.classList.add("low-stock");
      }

      list.appendChild(item);
    });

    // Attach delete handlers after items are added
    document.querySelectorAll("#drinks-list button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        fetch(`/drinks/${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then(() => location.reload())
          .catch((err) => console.error("Delete failed:", err));
      });
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

// Load personnel
function loadPersonnel() {
  fetch("/personnel")
    .then((res) => res.json())
    .then((people) => {
      const list = document.getElementById("personnel-list");
      list.innerHTML = "";
      people.forEach((person) => {
        const item = document.createElement("li");
        item.innerHTML = `
            <strong>${person.Name}</strong><br>
            Email: ${person.Email}<br>
            Phone: ${person.Phone}<br>
            Zone: ${person.Zone}<br>
            <button data-id="${person.PersonID}">🗑 Remove</button>
        `;
        list.appendChild(item);
      });
      document.querySelectorAll("#personnel-list button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          fetch(`/personnel/${id}`, { method: "DELETE" })
            .then(() => loadPersonnel())
            .catch((err) => console.error("Delete failed:", err));
        });
      });
    });
}

// Add new personnel
document
  .getElementById("add-personnel-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const Name = document.getElementById("p-name").value;
    const Email = document.getElementById("p-email").value;
    const Phone = document.getElementById("p-phone").value;
    const Zone = document.getElementById("p-zone").value;

    fetch("/personnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name, Email, Phone, Zone }),
    })
      .then((res) => res.json())
      .then(() => {
        document.getElementById("personnel-message").textContent =
          "Personnel added!";
        loadPersonnel(); // Refresh list
      })
      .catch((err) => {
        console.error("Add personnel failed:", err);
        document.getElementById("personnel-message").textContent =
          "Error adding personnel.";
      });
  });

// Load personnel when the section is shown
const observer = new MutationObserver(() => {
  if (document.getElementById("personnel-section").style.display === "block") {
    loadPersonnel();
  }
});
observer.observe(document.getElementById("personnel-section"), {
  attributes: true,
});
