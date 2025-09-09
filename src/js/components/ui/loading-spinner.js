export function showSpinner(container, message = 'Loading...') {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">${message}</p>
        </div>
    `;
}

export function hideSpinner(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) return;
    container.innerHTML = '';
}

export function createSpinner(size = 'normal', color = 'primary') {
    const sizeClass = size === 'small' ? 'spinner-border-sm' : '';
    
    return `
        <div class="spinner-border text-${color} ${sizeClass}" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
}