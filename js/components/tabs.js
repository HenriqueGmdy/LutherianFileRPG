export function initTabs() {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");

    if (tabButtons.length === 0) return;

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab");

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => {
                content.classList.remove("active");
                content.style.display = "none";
            });

            button.classList.add("active");
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active");
                targetContent.style.display = "block";
            }
        });
    });
}