document.addEventListener('DOMContentLoaded', function() {
    // Function to handle Creator Signup form submission
    async function submitCreatorSignup(event) {
        event.preventDefault();

        // Gather form data from the Creator signup form
        const displayName = document.getElementById('creator-displayname').value;
        const tokenSymbol = document.getElementById('token-symbol').value;
        const password = document.getElementById('creator-password').value;
        const creatorPublicKey = document.getElementById('creator-wallet').value;
        const bio = document.getElementById('creator-bio').value;
        const email = document.getElementById('creator-email').value;

        // Create an object with the collected data
        const formData = {
            displayName,
            tokenSymbol,
            password,
            creatorPublicKey,
            bio,
            email
        };

        try {
            // Send the form data to the backend via HTTP POST
            const response = await fetch('http://localhost:3000/signup-creator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert(`Creator account created successfully!\nMint Public Key: ${data.mintPublicKey}`);

                // Optionally store user details in sessionStorage
                sessionStorage.setItem('userAuthenticated', 'true');
                sessionStorage.setItem('userDisplayName', displayName);
                sessionStorage.setItem('mintPublicKey', data.mintPublicKey);

                // Redirect to the dashboard page
                window.location.href = 'pages/dashboard.html';
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        }
    }

    // Attach the handler to the Creator form if it exists
    const creatorForm = document.getElementById('creator-form');
    if (creatorForm) {
        creatorForm.addEventListener('submit', submitCreatorSignup);
    } else {
        console.error("Creator form not found.");
    }
});
