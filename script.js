/* =====================================================
   CARD GAME SCORE KEEPER
===================================================== */


/* =====================================================
   DEFAULT DATA
===================================================== */

const DEFAULT_PLAYERS = [
    {
        name: "Player 1",
        score: 0,
        history: []
    },
    {
        name: "Player 2",
        score: 0,
        history: []
    },
    {
        name: "Player 3",
        score: 0,
        history: []
    },
    {
        name: "Player 4",
        score: 0,
        history: []
    }
];


let players = loadGame();

let currentRound =
    Number(localStorage.getItem("cardGameRound")) || 1;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const playersContainer =
    document.getElementById("playersContainer");

const totalScoreElement =
    document.getElementById("totalScore");

const roundNumberElement =
    document.getElementById("roundNumber");

const messageElement =
    document.getElementById("message");

const nextRoundButton =
    document.getElementById("nextRoundBtn");

const newGameButton =
    document.getElementById("newGameBtn");

const modal =
    document.getElementById("modal");

const cancelModal =
    document.getElementById("cancelModal");

const confirmNewGame =
    document.getElementById("confirmNewGame");


/* =====================================================
   INITIALIZE
===================================================== */

renderPlayers();

updateTotalScore();

updateRound();


/* =====================================================
   RENDER PLAYERS
===================================================== */

function renderPlayers() {

    playersContainer.innerHTML = "";

    const highestScore =
        Math.max(...players.map(player => player.score));


    players.forEach((player, index) => {

        const card =
            document.createElement("article");

        card.className = "player-card";


        /*
         * Highest score badge
         */

        if (
            players.some(p => p.score !== 0) &&
            player.score === highestScore
        ) {

            card.classList.add("leading");

            const badge =
                document.createElement("div");

            badge.className = "leading-badge";

            badge.textContent = "LEADING";

            card.appendChild(badge);
        }


        /*
         * Card Top
         */

        const cardTop =
            document.createElement("div");

        cardTop.className = "card-top";


        const suit =
            document.createElement("span");

        suit.className = "suit";

        const suits = ["♠", "♥", "♦", "♣"];

        suit.textContent = suits[index];


        const playerNumber =
            document.createElement("span");

        playerNumber.className =
            "player-number";

        playerNumber.textContent =
            `PLAYER ${String(index + 1).padStart(2, "0")}`;


        cardTop.appendChild(suit);

        cardTop.appendChild(playerNumber);


        /*
         * Player Name
         */

        const nameInput =
            document.createElement("input");

        nameInput.type = "text";

        nameInput.className =
            "player-name";

        nameInput.value =
            player.name;

        nameInput.maxLength = 20;

        nameInput.placeholder =
            `Player ${index + 1}`;


        nameInput.addEventListener(
            "input",
            function () {

                players[index].name =
                    this.value;

                saveGame();
            }
        );


        /*
         * Score
         */

        const score =
            document.createElement("div");

        score.className = "score";

        score.textContent =
            player.score;


        if (player.score > 0) {
            score.classList.add("positive");
        }

        if (player.score < 0) {
            score.classList.add("negative");
        }


        /*
         * Input area
         */

        const inputArea =
            document.createElement("div");

        inputArea.className =
            "score-input";


        const calculationInput =
            document.createElement("input");

        calculationInput.type = "text";

        calculationInput.className =
            "calculation";

        calculationInput.placeholder =
            "1+2 or 5-3";

        calculationInput.autocomplete =
            "off";


        const addButton =
            document.createElement("button");

        addButton.type = "button";

        addButton.className =
            "add-btn";

        addButton.textContent =
            "ADD";


        /*
         * Add button
         */

        addButton.addEventListener(
            "click",
            function () {

                addScore(
                    index,
                    calculationInput
                );

            }
        );


        /*
         * Enter key
         */

        calculationInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    addScore(
                        index,
                        calculationInput
                    );

                }

            }
        );


        inputArea.appendChild(
            calculationInput
        );

        inputArea.appendChild(
            addButton
        );


        /*
         * History
         */

        const history =
            document.createElement("div");

        history.className =
            "history";


        if (player.history.length === 0) {

            history.textContent =
                "No entries yet";

        } else {

            const title =
                document.createElement("span");

            title.className =
                "history-title";

            title.textContent =
                "Recent:";

            history.appendChild(title);


            const recent =
                player.history.slice(-3);


            recent.forEach(
                (entry, entryIndex) => {

                    const line =
                        document.createElement("div");

                    line.textContent =
                        entry;

                    history.appendChild(line);

                }
            );

        }


        /*
         * Undo
         */

        const undoButton =
            document.createElement("button");

        undoButton.type = "button";

        undoButton.className =
            "undo-btn";

        undoButton.textContent =
            "↶ Undo Last";

        undoButton.disabled =
            player.history.length === 0;


        undoButton.addEventListener(
            "click",
            function () {

                undoScore(index);

            }
        );


        /*
         * Build card
         */

        card.appendChild(cardTop);

        card.appendChild(nameInput);

        card.appendChild(score);

        card.appendChild(inputArea);

        card.appendChild(history);

        card.appendChild(undoButton);


        playersContainer.appendChild(card);

    });

}


/* =====================================================
   CALCULATE EXPRESSION
===================================================== */

/*
   Supported:

   1+2       = 3
   5-3       = 2
   10-4+2    = 8
   10 + 5    = 15
   -5+2      = -3

   Not allowed:

   5*3
   10/2
   abc
*/

function calculateExpression(expression) {

    if (!expression) {
        return null;
    }


    /*
     * Remove spaces
     */

    const clean =
        expression.replace(/\s+/g, "");


    /*
     * Only numbers and + -
     */

    const validPattern =
        /^[+-]?\d+(?:[+-]\d+)*$/;


    if (!validPattern.test(clean)) {

        return null;

    }


    /*
     * Extract numbers
     */

    const numbers =
        clean.match(/[+-]?\d+/g);


    if (!numbers) {

        return null;

    }


    let result = 0;


    numbers.forEach(
        number => {

            result +=
                Number(number);

        }
    );


    /*
     * Safety check
     */

    if (!Number.isFinite(result)) {

        return null;

    }


    /*
     * Limit extreme values
     */

    if (
        result > 1000000 ||
        result < -1000000
    ) {

        return null;

    }


    return result;

}


/* =====================================================
   ADD SCORE
===================================================== */

function addScore(
    playerIndex,
    input
) {

    const expression =
        input.value.trim();


    /*
     * Empty validation
     */

    if (!expression) {

        showMessage(
            "Please enter a score.",
            "error"
        );

        input.focus();

        return;

    }


    /*
     * Calculate
     */

    const result =
        calculateExpression(expression);


    /*
     * Invalid calculation
     */

    if (result === null) {

        showMessage(
            "Invalid calculation. Use examples like 1+2, 5-3 or 10-4+2.",
            "error"
        );

        input.focus();

        return;

    }


    /*
     * Don't allow zero
     */

    if (result === 0) {

        showMessage(
            "This calculation gives 0 points.",
            "error"
        );

        return;

    }


    /*
     * Update score
     */

    players[playerIndex].score +=
        result;


    /*
     * Save history
     */

    const formattedResult =
        result > 0
            ? `+${result}`
            : `${result}`;


    players[playerIndex].history.push({

        expression:
            expression,

        value:
            result,

        round:
            currentRound

    });


    /*
     * Clear input
     */

    input.value = "";


    /*
     * Save

     */

    saveGame();


    /*
     * Update UI
     */

    renderPlayers();

    updateTotalScore();


    /*
     * Message
     */

    const playerName =
        players[playerIndex].name ||
        `Player ${playerIndex + 1}`;


    showMessage(
        `${playerName}: ${expression} = ${formattedResult}`,
        "success"
    );

}


/* =====================================================
   UNDO SCORE
===================================================== */

function undoScore(playerIndex) {

    const history =
        players[playerIndex].history;


    if (history.length === 0) {

        return;

    }


    /*
     * Last entry
     */

    const lastEntry =
        history.pop();


    /*
     * Remove score

     */

    players[playerIndex].score -=
        lastEntry.value;


    /*
     * Save

     */

    saveGame();


    /*
     * Render

     */

    renderPlayers();

    updateTotalScore();


    showMessage(
        `Removed ${lastEntry.expression} from ${players[playerIndex].name}.`,
        "success"
    );

}


/* =====================================================
   TOTAL SCORE
===================================================== */

function updateTotalScore() {

    const total =
        players.reduce(
            (sum, player) =>
                sum + player.score,
            0
        );


    totalScoreElement.textContent =
        total;

}


/* =====================================================
   ROUND
===================================================== */

function updateRound() {

    roundNumberElement.textContent =
        currentRound;

}


/* =====================================================
   NEXT ROUND
===================================================== */

nextRoundButton.addEventListener(
    "click",
    function () {

        currentRound++;

        localStorage.setItem(
            "cardGameRound",
            currentRound
        );


        updateRound();


        showMessage(
            `Round ${currentRound} started.`,
            "success"
        );

    }
);


/* =====================================================
   NEW GAME MODAL
===================================================== */

newGameButton.addEventListener(
    "click",
    function () {

        modal.classList.remove(
            "hidden"
        );

    }
);


/* =====================================================
   CANCEL MODAL
===================================================== */

cancelModal.addEventListener(
    "click",
    function () {

        modal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   CONFIRM NEW GAME
===================================================== */

confirmNewGame.addEventListener(
    "click",
    function () {

        players =
            DEFAULT_PLAYERS.map(
                player => ({
                    name: player.name,
                    score: 0,
                    history: []
                })
            );


        currentRound = 1;


        localStorage.removeItem(
            "cardGameData"
        );


        localStorage.setItem(
            "cardGameRound",
            "1"
        );


        modal.classList.add(
            "hidden"
        );


        renderPlayers();

        updateTotalScore();

        updateRound();


        showMessage(
            "New game started!",
            "success"
        );

    }
);


/* =====================================================
   CLOSE MODAL BY CLICKING OUTSIDE
===================================================== */

modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            modal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   ESCAPE KEY FOR MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !modal.classList.contains("hidden")
        ) {

            modal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   MESSAGE
===================================================== */

let messageTimer;


function showMessage(
    text,
    type = ""
) {

    clearTimeout(
        messageTimer
    );


    messageElement.textContent =
        text;


    messageElement.className =
        "message";


    if (type) {

        messageElement.classList.add(
            type
        );

    }


    messageTimer =
        setTimeout(
            function () {

                messageElement.textContent =
                    "";

                messageElement.className =
                    "message";

            },
            3500
        );

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveGame() {

    localStorage.setItem(
        "cardGameData",
        JSON.stringify(players)
    );

}


function loadGame() {

    try {

        const saved =
            localStorage.getItem(
                "cardGameData"
            );


        if (!saved) {

            return DEFAULT_PLAYERS.map(
                player => ({
                    name: player.name,
                    score: 0,
                    history: []
                })
            );

        }


        const parsed =
            JSON.parse(saved);


        /*
         * Validate basic structure
         */

        if (
            !Array.isArray(parsed) ||
            parsed.length !== 4
        ) {

            throw new Error(
                "Invalid saved data"
            );

        }


        return parsed.map(
            (player, index) => ({

                name:
                    typeof player.name === "string"
                        ? player.name
                        : `Player ${index + 1}`,

                score:
                    Number.isFinite(
                        Number(player.score)
                    )
                        ? Number(player.score)
                        : 0,

                history:
                    Array.isArray(player.history)
                        ? player.history
                        : []

            })
        );

    } catch (error) {

        console.warn(
            "Could not load saved game.",
            error
        );


        return DEFAULT_PLAYERS.map(
            player => ({
                name: player.name,
                score: 0,
                history: []
            })
        );

    }

}