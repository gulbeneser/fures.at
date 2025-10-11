// @ts-nocheck

export const downloadHTML = (htmlContent: string, filename: string = 'cv.html') => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const downloadPDF = async (htmlContent: string, filename: string = 'cv.pdf') => {
    const { jsPDF } = window.jspdf;
    
    // Create an off-screen container to render the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Position off-screen
    container.style.width = '794px'; // A4 width in pixels for consistent rendering
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts:true
        });

        // Use the html method with its internal html2canvas integration for robust multi-page support
        await pdf.html(container, {
            callback: function (doc) {
                doc.save(filename);
            },
            x: 0,
            y: 0,
            width: pdf.internal.pageSize.getWidth(),
            // This is crucial for multi-page PDFs, it tells the renderer the full width of the content
            windowWidth: container.scrollWidth 
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error("Failed to create PDF. The generated design might have issues.");
    } finally {
        // Clean up the off-screen container
        document.body.removeChild(container);
    }
};
