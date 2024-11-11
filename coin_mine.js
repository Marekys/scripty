(function () {
    // Check if we're already on the "snob" screen, else navigate there
    if (game_data.screen !== 'snob') {
        console.log("Navigating to the 'snob' screen.");
        window.location.href = "/game.php?screen=snob";
    } else {
        console.log("Already on the 'snob' screen.");
        executeCoinMinting();
    }

    // Function to mint coins
    function executeCoinMinting() {
        // Click to set the maximum number of coins to mint
        const maxButton = document.getElementById("coin_mint_fill_max");
        if (maxButton) {
            console.log("Clicking the max button to fill max coins.");
            maxButton.click();
        } else {
            console.warn("Max button not found.");
        }

        // Click the mint button to mint the coins
        const mintButton = document.querySelector("input.btn[value='Raziť']");
        if (mintButton) {
            console.log("Minting coins.");
            mintButton.click();
        } else {
            console.warn("Mint button not found.");
        }
    }
})();
