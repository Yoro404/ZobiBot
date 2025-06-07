## Installation & Setup Instructions

Follow these steps to install and set up ZobiBot:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/Yoro404/ZobiBot.git
    cd ZobiBot
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**

    Create a `.env` file in the root directory of the project. Add the following environment variables, replacing the placeholders with your actual values:

    ```
    DISCORD_TOKEN=<Your_Discord_Bot_Token>
    CLIENT_ID=<Your_Discord_Client_ID>
    MONGODB_URI=<Your_MongoDB_Connection_String>
    GUILD_ID=<Your_Discord_Server_ID> # The primary guild for deploying commands
    ```

4.  **Configure the Bot:**

    *   **`config/bot.json`:** for level give roles.
    *   **`config/config.js`:** Configure any specific Javascript settings.
5.  **Deploy Commands:**

    Run the `deploy.js` script to register slash commands with Discord:

    ```bash
    node deploy.js
    ```
    *Important: You will need to specify the GUILD_ID in the .env file for the deploy script to function correctly. This is where the bot's commands will be deployed.*

6.  **Start the Bot:**

    ```bash
    node bot.js
    ```

    The bot should now be online and connected to your Discord server.

## Usage Examples

### Moderation Commands

*   **Ban a member:** `/ban member:<user> reason:<reason>`
*   **Kick a member:** `/kick member:<user> reason:<reason>`

### Music Commands

*   **Play music:** `/play <song_name_or_url>`
*   **Pause music:** `/pause`
*   **Resume music:** `/resume`
*   **Skip music:** `/skip`
*   **Stop music:** `/stop`
*   **View queue:** `/queue`
*   **Loop music:** `/loop mode:<off|track|queue>`
*   **Now playing:** `/nowplaying`

### Other Commands

*   **Check ping:** `/ping`
*   **View leaderboard:** `/leaderboard limit:<number>` (optional limit of 1-20 users)
