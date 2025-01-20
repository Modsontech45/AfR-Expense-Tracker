const scriptURL =
  "https://script.google.com/macros/s/AKfycbxCF32mIKYBF1M8HI47ULIZXuZR9e2OhHeAhk86vph0L1YcNh0JI8ouZW26yDpsDRx9MQ/exec";

function showSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex"; // Show the spinner
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "none"; // Hide the spinner
}

function addTransaction() {
  showSpinner(); // Show the spinner when the transaction is being added

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const type = document.getElementById("type").value.trim();
  const field = document.getElementById("field").value.trim();
  const amount = Number(document.getElementById("amount").value.trim());
  const notes = document.getElementById("notes").value.trim();

  // Validate input fields
  if (!name || !description || !type || !field || isNaN(amount)) {
    alert("Please fill in all fields correctly.");
    hideSpinner();
    return;
  }

  const requestBody = {
    action: "addTransaction",
    name,
    description,
    type,
    field,
    amount,
    notes,
  };

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      getAccountBalance();
    })
    .catch((error) => console.error("Error:", error))
    .finally(hideSpinner); // Ensure spinner is hidden
}

async function getAccountBalance() {
  showSpinner(); // Show the spinner when fetching account balance

  await fetch(`${scriptURL}?sheet=Summary`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);
      if (Array.isArray(data) && data.length >= 2) {
        const resultObject = data[0].reduce((acc, key, index) => {
          acc[key] = data[1][index]; // Map values from the second array
          return acc;
        }, {});

        console.log(resultObject);
        sessionStorage.setItem("accountBalance", JSON.stringify(resultObject));
        setBalances();
      } else {
        console.error("Unexpected API response format:", data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      hideSpinner(); // Hide the spinner after operation is complete
    });
}

async function getByFilter(name) {
  showSpinner(); // Show the spinner when fetching account balance

  await fetch(`${scriptURL}?action=filter`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);
      const result = data.find(
        (row) => row.name.toLowerCase() === name.toLowerCase()
      );

      // Select the container to append the labels
      const labelContainer = document.getElementById("labelContainer");
      labelContainer.innerHTML = ""; // Clear previous content
      if (!result) {
        const label = document.createElement("div");
        const sentenceCaseName = name.at(0).toUpperCase() + name.slice(1);
        label.textContent =
          "No Data found for selected search value:  " + sentenceCaseName;
        label.style.color = "white";
        labelContainer.appendChild(label);

        return;
      }
      // Generate and append the custom labels
      Object.entries(result).forEach(([key, val]) => {
        const label = document.createElement("div");
        label.style.marginBottom = "10px"; // Optional styling
        const currencyHeaders = ["expense", "income", "balance"];
        // Set the label text with custom label and formatted value
        label.textContent = `${key}: ${val.toLocaleString()} ${
          currencyHeaders.includes(key) ? "FCFA" : ""
        }`;

        // Add a class based on the custom label to allow specific targeting in CSS
        label.className = key.replace(/[^a-zA-Z0-9]/g, "_") + "_header"; // Replace special characters with underscores

        labelContainer.appendChild(label);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      hideSpinner(); // Hide the spinner after operation is complete
    });
}

function handleViewChange(event) {
  const selectedValue = event.target.value; // Access the selected option's value
  if (!selectedValue) {
    console.log("No option selected!");
    return;
  }

  // You can now handle the selected option's value as needed
  console.log(`Fetch data for: ${selectedValue}`);
  const searchVal =
    selectedValue.toLowerCase() === "total" ? "grand total" : selectedValue;
  getByFilter(searchVal);
}

function setBalances() {
  // Retrieve the account data from session storage
  const accountData = sessionStorage.getItem("accountBalance");

  // Parse the data to convert it back to an object
  const data = accountData && JSON.parse(accountData);
  console.log(accountData, data);

  // Check if data exists
  if (!data) {
    console.error("No account data found in session storage.");
    return;
  }

  // Define the custom labels for each data key
  const customLabels = {
    "Total Income": "Total Money Sent",
    "Total Expense": "Total Expense",
    "Net Profit/Loss": "Account Balance",
    "Net Profit Percent": "Net Profit Percent",
  };

  // Select the container to append the labels
  const labelContainer = document.getElementById("labelContainer");
  labelContainer.innerHTML = ""; // Clear previous content

  // Generate and append the custom labels
  Object.keys(customLabels).forEach((key) => {
    const label = document.createElement("div");
    label.style.marginBottom = "10px"; // Optional styling

    // Format the value based on the key
    let formattedValue;
    if (key === "Net Profit Percent") {
      formattedValue = `${(parseFloat(data[key]) * 100).toFixed(2)} %`; // Format percentage with 2 decimal places
    } else {
      const value = data[key];
      formattedValue = `${
        typeof value === "number"
          ? value.toLocaleString()
          : parseFloat(value).toLocaleString()
      } FCFA`; // Format with commas for thousands
    }

    // Set the label text with custom label and formatted value
    label.textContent = `${customLabels[key]}: ${formattedValue}`;

    // Add a class based on the custom label to allow specific targeting in CSS
    label.className = key.replace(/[^a-zA-Z0-9]/g, "_"); // Replace special characters with underscores

    labelContainer.appendChild(label);
  });
}

function main() {
  getAccountBalance();
}

document.addEventListener("DOMContentLoaded", main);
