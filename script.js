const form = document.getElementById("subscribeForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const button = document.getElementById("subscribeButton");

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const email = emailInput.value.trim();

  message.textContent = "Sending...";
  button.disabled = true;

  try {
    const response = await fetch("/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });

    const data = await response.json();
    message.textContent = data.message;

    if (response.ok) {
      form.reset();
    }
  } catch (error) {
    console.log("Request error:", error);
    message.textContent = "Could not connect to the server. Please try again.";
  } finally {
    button.disabled = false;
  }
});
