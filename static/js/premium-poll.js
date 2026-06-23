(function () {
  const params = new URLSearchParams(globalThis.location.search);
  const checkoutId = params.get("checkout_id");
  if (!checkoutId) {
    globalThis.location.href = "/";
    return;
  }

  const h1 = document.querySelector("h1");
  const p = document.querySelector("p");
  const spinner = document.querySelector(".animate-spin");

  let attempts = 0;
  const maxAttempts = 20;
  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(
        "/api/premium/status?checkout_id=" + checkoutId,
      );
      const data = await res.json();

      if (data.status === "paid" && data.premiumToken) {
        clearInterval(interval);
        localStorage.setItem("buttonspa-premium", "true");
        localStorage.setItem("buttonspa-premium-token", data.premiumToken);
        if (h1) h1.textContent = "🎉 Premium Unlocked!";
        if (p) {
          p.textContent =
            "You now have unlimited AI transcriptions with the best models.";
        }
        if (spinner) spinner.style.display = "none";
        setTimeout(() => {
          globalThis.location.href = "/";
        }, 2000);
      } else if (
        data.status === "expired" || data.status === "not_found"
      ) {
        clearInterval(interval);
        if (h1) h1.textContent = "Payment not found";
        if (p) {
          p.textContent = "The checkout may have expired. Please try again.";
        }
        if (spinner) spinner.style.display = "none";
      }
    } catch (_e) {
      // Keep polling on network errors
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      if (h1) h1.textContent = "Taking too long?";
      if (p) {
        p.textContent =
          "Your payment may still process. Refresh or check back at ButtonSpa.";
      }
      if (spinner) spinner.style.display = "none";
    }
  }, 2500);
})();
