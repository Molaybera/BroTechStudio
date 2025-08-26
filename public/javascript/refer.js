// This wrapper makes sure the code doesn't run until the HTML page is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // link that use for copy and share.
    const shareableLink = "https://molaybera.github.io/portfolio/";

    // --- ELEMENT REFERENCES ---
    const openModalButton = document.getElementById('openModalButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const shareModal = document.getElementById('shareModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const copyButtonText = document.getElementById('copyButtonText');
    const shareToAppButton = document.getElementById('shareToAppButton');
    const shareToAppSection = document.getElementById('shareToAppSection');
    const divider = document.getElementById('divider');
    const linkInput = document.getElementById('linkInput');

    // Make sure all elements were found before proceeding
    if (!openModalButton || !closeModalButton || !shareModal || !linkInput) {
        console.error("Modal elements could not be found. Check your HTML IDs.");
        return; // Stop the script if essential elements are missing
    }

    // Set the input field to show the shareable link
    linkInput.value = shareableLink;

    // --- MODAL FUNCTIONS ---
    const openModal = () => {
        shareModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modalOverlay.classList.add('modal-overlay-enter-active');
            shareModal.querySelector('.modal-card-enter').classList.add('modal-card-enter-active');
        });
    };
    
    const closeModal = () => {
        document.body.style.overflow = '';
        modalOverlay.classList.remove('modal-overlay-enter-active');
        shareModal.querySelector('.modal-card-enter').classList.remove('modal-card-enter-active');
        // Hide the modal after the animation finishes (200ms)
        setTimeout(() => shareModal.classList.add('hidden'), 200);
    };

    // --- EVENT LISTENERS ---
    openModalButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // "Copy Link" Button Logic
    copyLinkButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            copyButtonText.textContent = 'Copied!';
            setTimeout(() => { copyButtonText.textContent = 'Copy'; }, 2000);
        } catch (err) {
            console.error('Failed to copy link: ', err);
            copyButtonText.textContent = 'Error!';
        }
    });

    // "Share to App" Button Logic (only shows on supported devices like phones)
    if (navigator.share) {
        shareToAppSection.classList.remove('hidden');
        divider.classList.remove('hidden');

        shareToAppButton.addEventListener('click', async () => {
            const shareData = {
                title: 'Check out BroTech!',
                text: `I thought you might like this service. Check it out here: ${shareableLink}`,
                url: shareableLink
            };
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        });
    } else {
        shareToAppSection.classList.add('hidden');
        divider.classList.add('hidden');
    }

});