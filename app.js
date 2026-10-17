
"use strict";

const STORAGE_KEY = "swissmaster-tournament";

const step1 = document.getElementById("setup-step-1");
const step2 = document.getElementById("setup-step-2");

const indicator1 = document.getElementById("step-indicator-1");
const indicator2 = document.getElementById("step-indicator-2");

const tournamentName = document.getElementById("tournament-name");
const pairingSystem = document.getElementById("pairing-system");
const boardsCount = document.getElementById("boards-count");
const totalRounds = document.getElementById("total-rounds");
const rulesPreset = document.getElementById("rules-preset");

const modeInputs = document.querySelectorAll(
    'input[name="tournament-mode"]'
);

const participantForm = document.getElementById("participant-form");
const participantName = document.getElementById("participant-name");
const participantLabel = document.getElementById("participant-label");
const addButton = document.getElementById("add-participant");
const participantList = document.getElementById("participant-list");
const participantListTitle = document.getElementById("participant-list-title");
const emptyMessage = document.getElementById("empty-message");
const description = document.getElementById("participant-description");

const nextButton = document.getElementById("next-to-participants");
const backButton = document.getElementById("back-to-settings");
const finishButton = document.getElementById("finish-setup");

let participants = [];

// Get tournament mode

function getTournamentMode() {
    return document.querySelector(
        'input[name="tournament-mode"]:checked'
    )?.value ?? "TEAM";
}

// Get tournament data

function getTournamentData() {
    return {
        name: tournamentName.value.trim(),
        mode: getTournamentMode(),
        pairingSystem: pairingSystem.value,
        boards: Number(boardsCount.value),
        rounds: Number(totalRounds.value),
        rules: rulesPreset.value,
        participants: [...participants]
    };
}

// Save tournament draft

function saveDraft() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(getTournamentData())
        );
    } catch (error) {
        console.error("Couldn't save tournament draft:", error);
    }
}

// Load tournament draft

function loadDraft() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return;
        }

        tournamentName.value =
            typeof data.name === "string" ? data.name : "";

        if (["SWISS", "ROUND_ROBIN"].includes(data.pairingSystem)) {
            pairingSystem.value = data.pairingSystem;
        }

        if (
            Number.isInteger(data.boards) &&
            data.boards >= 1
        ) {
            boardsCount.value = data.boards;
        }

        if (
            Number.isInteger(data.rounds) &&
            data.rounds >= 1
        ) {
            totalRounds.value = data.rounds;
        }

        if (["FIDE", "CASUAL", "CUSTOM"].includes(data.rules)) {
            rulesPreset.value = data.rules;
        }

        const modeInput = document.querySelector(
            `input[name="tournament-mode"][value="${data.mode}"]`
        );

        if (modeInput) {
            modeInput.checked = true;
        }

        if (Array.isArray(data.participants)) {
            participants = [
                ...new Set(
                    data.participants.filter(
                        (item) =>
                            typeof item === "string" &&
                            item.trim().length > 0
                    )
                )
            ];
        }
    } catch (error) {
        console.error("Couldn't restore tournament draft:", error);
    }
}

// Navigate between setup steps

function showSetupStep(step) {
    const showSettings = step === 1;

    step1.classList.toggle("active", showSettings);
    step2.classList.toggle("active", !showSettings);

    indicator1.classList.toggle("active", showSettings);
    indicator2.classList.toggle("active", !showSettings);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Validate tournament settings

function validateTournamentSettings() {
    if (!tournamentName.value.trim()) {
        alert("Please enter a tournament name.");
        tournamentName.focus();
        return false;
    }

    if (
        !Number.isInteger(Number(boardsCount.value)) ||
        Number(boardsCount.value) < 1
    ) {
        alert("Please enter a valid number of boards.");
        boardsCount.focus();
        return false;
    }

    if (
        !Number.isInteger(Number(totalRounds.value)) ||
        Number(totalRounds.value) < 1
    ) {
        alert("Please enter a valid number of rounds.");
        totalRounds.focus();
        return false;
    }

    return true;
}

nextButton.addEventListener("click", () => {
    if (!validateTournamentSettings()) return;

    saveDraft();
    showSetupStep(2);
});

backButton.addEventListener("click", () => {
    saveDraft();
    showSetupStep(1);
});

// Update form labels based on tournament mode

function updateParticipantMode() {
    const isTeam = getTournamentMode() === "TEAM";

    participantLabel.textContent = isTeam
        ? "Team Name"
        : "Player Name";

    participantName.placeholder = isTeam
        ? "Enter team name"
        : "Enter player name";

    addButton.textContent = isTeam
        ? "+ Add Team"
        : "+ Add Player";

    description.textContent = isTeam
        ? "Add the teams that will participate in your tournament."
        : "Add the players that will participate in your tournament.";

    renderParticipants();
}

// Listen for mode changes

modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
        updateParticipantMode();
        saveDraft();
    });
});

// Display participants

function renderParticipants() {
    const isTeam = getTournamentMode() === "TEAM";

    participantList.replaceChildren();

    participants.forEach((participant, index) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const removeButton = document.createElement("button");

        name.textContent = participant;

        removeButton.textContent = "Remove";
        removeButton.className = "remove-participant";
        removeButton.type = "button";

        removeButton.setAttribute(
            "aria-label",
            `Remove ${participant}`
        );

        removeButton.addEventListener("click", () => {
            participants.splice(index, 1);
            renderParticipants();
            saveDraft();
        });

        item.append(name, removeButton);
        participantList.appendChild(item);
    });

    participantListTitle.textContent =
        `${isTeam ? "Teams" : "Players"} (${participants.length})`;

    emptyMessage.textContent =
        `No ${isTeam ? "teams" : "players"} added yet.`;

    emptyMessage.hidden = participants.length > 0;
}

// Add participants

participantForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = participantName.value.trim();

    if (!name) {
        participantName.focus();
        return;
    }

    const duplicate = participants.some(
        (participant) =>
            participant.toLocaleLowerCase() ===
            name.toLocaleLowerCase()
    );

    if (duplicate) {
        alert("This participant has already been added.");
        participantName.focus();
        return;
    }

    participants.push(name);
    participantName.value = "";

    renderParticipants();
    saveDraft();

    participantName.focus();
});

// Finish setup

finishButton.addEventListener("click", () => {
    if (!validateTournamentSettings()) {
        showSetupStep(1);
        return;
    }

    if (participants.length === 0) {
        alert("Please add at least one team or player.");
        participantName.focus();
        return;
    }

    const tournament = getTournamentData();

    saveDraft();

    console.log("Tournament setup completed:", tournament);

    alert(
        `Tournament "${tournament.name}" is ready!\n\n` +
        `${participants.length} participant(s) added.\n` +
        `System: ${tournament.pairingSystem === "SWISS"
            ? "Swiss System"
            : "Round Robin"
        }\n` +
        `Rounds: ${tournament.rounds}`
    );
});

// Automatically save settings

[
    tournamentName,
    pairingSystem,
    boardsCount,
    totalRounds,
    rulesPreset
].forEach((element) => {
    element.addEventListener("input", saveDraft);
    element.addEventListener("change", saveDraft);
});

// Initialize application

loadDraft();
updateParticipantMode();
showSetupStep(1);
