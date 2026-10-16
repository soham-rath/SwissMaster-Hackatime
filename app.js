
const step1 = document.getElementById("setup-step-1");
const step2 = document.getElementById("setup-step-2");

const indicator1 = document.getElementById("step-indicator-1");
const indicator2 = document.getElementById("step-indicator-2");

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

let participants = [];

function showSetupStep(step) {
    const firstStep = step === 1;

    step1.classList.toggle("active", firstStep);
    step2.classList.toggle("active", !firstStep);

    indicator1.classList.toggle("active", firstStep);
    indicator2.classList.toggle("active", !firstStep);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getTournamentMode() {
    return document.querySelector(
        'input[name="tournament-mode"]:checked'
    ).value;
}

function updateParticipantMode() {
    const isTeam = getTournamentMode() === "TEAM";

    participantLabel.textContent = isTeam ? "Team Name" : "Player Name";
    participantName.placeholder = isTeam
        ? "Enter team name"
        : "Enter player name";

    addButton.textContent = isTeam ? "+ Add Team" : "+ Add Player";

    description.textContent = isTeam
        ? "Add the teams that will participate in your tournament."
        : "Add the players that will participate in your tournament.";

    participantListTitle.textContent = isTeam
        ? `Teams (${participants.length})`
        : `Players (${participants.length})`;

    renderParticipants();
}

function renderParticipants() {
    const isTeam = getTournamentMode() === "TEAM";

    participantList.innerHTML = "";

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
        });

        item.append(name, removeButton);
        participantList.appendChild(item);
    });

    participantListTitle.textContent = isTeam
        ? `Teams (${participants.length})`
        : `Players (${participants.length})`;

    emptyMessage.hidden = participants.length > 0;
}

document
    .getElementById("next-to-participants")
    .addEventListener("click", () => {
        const tournamentName = document
            .getElementById("tournament-name")
            .value.trim();

        const boards = Number(
            document.getElementById("boards-count").value
        );

        const rounds = Number(
            document.getElementById("total-rounds").value
        );

        if (!tournamentName) {
            alert("Please enter a tournament name.");
            document.getElementById("tournament-name").focus();
            return;
        }

        if (!Number.isInteger(boards) || boards < 1) {
            alert("Please enter at least one board.");
            document.getElementById("boards-count").focus();
            return;
        }

        if (!Number.isInteger(rounds) || rounds < 1) {
            alert("Please enter at least one round.");
            document.getElementById("total-rounds").focus();
            return;
        }

        showSetupStep(2);
    });

document
    .getElementById("back-to-settings")
    .addEventListener("click", () => showSetupStep(1));

modeInputs.forEach((input) => {
    input.addEventListener("change", updateParticipantMode);
});

participantForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = participantName.value.trim();

    if (!name) {
        participantName.focus();
        return;
    }

    const duplicate = participants.some(
        (participant) =>
            participant.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        alert("This participant has already been added.");
        participantName.focus();
        return;
    }

    participants.push(name);
    participantName.value = "";
    participantName.focus();

    renderParticipants();
});

document
    .getElementById("finish-setup")
    .addEventListener("click", () => {
        if (participants.length === 0) {
            alert("Please add at least one participant or team.");
            participantName.focus();
            return;
        }

        const tournament = {
            name: document.getElementById("tournament-name").value.trim(),
            mode: getTournamentMode(),
            pairingSystem: document.getElementById("pairing-system").value,
            boards: Number(document.getElementById("boards-count").value),
            rounds: Number(document.getElementById("total-rounds").value),
            rules: document.getElementById("rules-preset").value,
            participants: [...participants]
        };

        console.log("Tournament setup:", tournament);

        alert(
            `Setup completed for "${tournament.name}"!\n` +
            `${participants.length} participant(s) added.`
        );
    });

updateParticipantMode();
