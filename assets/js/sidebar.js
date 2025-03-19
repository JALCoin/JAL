function initSidebar() {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const connectWalletBtn = document.getElementById("connect-wallet-btn");
  const walletModal = document.getElementById("wallet-modal");
  const closeWalletModal = document.getElementById("close-wallet-modal");

  if (!hamburger || !sidebar) {
    console.error("Sidebar elements not found");
    return;
  }

  // Toggle sidebar when hamburger is clicked
  hamburger.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });

  // Open wallet modal when "Connect Wallet" is clicked
  if (connectWalletBtn && walletModal && closeWalletModal) {
    connectWalletBtn.addEventListener("click", function () {
      walletModal.classList.add("open");
    });

    // Close wallet modal when "Close" button is clicked
    closeWalletModal.addEventListener("click", function () {
      walletModal.classList.remove("open");
    });

    // Optional: Close wallet modal if clicking outside the modal content
    walletModal.addEventListener("click", function (e) {
      if (e.target === walletModal) {
        walletModal.classList.remove("open");
      }
    });
  }
}
