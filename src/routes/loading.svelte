<script>
  export let message = "Loading math.js modules...";
</script>

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--background-color);;
    color: var(--text-color);
    font-size: 1.2em;
    font-family: Arial, sans-serif;
    text-align: center;
  }

  .spinner {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid rgb(86 85 132 / var(--tw-bg-opacity)); /* Blue */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-right: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .message {
    margin: 0;
    font-size: 1.2em;
    color: var(--text-color);
  }

</style>

<div class="loading-container">
  <div class="spinner"></div>
  <p class="message">{message}</p>
</div>
