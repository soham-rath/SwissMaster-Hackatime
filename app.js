const step1 = document.getElementById("setup-step-1");
const step2 = document.getElementById("setup-step-2");


const indicator1 = document.getElementById("step-indicator-1");
const indicator2 = document.getElementById("step-indicator-2");

function showSetupStep(step) {
    const firstStep = step === 1;

    step1.classList.toggle("active", firstStep);
    step2.classList.toggle("active", !firstStep);

    indicator1.classList.toggle("active", firstStep);
    indicator2.classList.toggle("active", !firstStep);
}

document
    .getElementById("next-to-participants")
    .addEventListener("click", () => showSetupStep(2));

document
    .getElementById("back-to-settings")
    .addEventListener("click", () => showSetupStep(1));