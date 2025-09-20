
'use server';

import puppeteer from 'puppeteer';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';

function createMagazineHtml(data: GenerateMagazineOutput): string {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const sectionsHtml = data.sections.map(section => `
        <div class="mb-12 break-after-page">
            <h2 class="text-3xl font-bold font-headline text-primary border-b-2 border-primary pb-2 mb-4">${section.title}</h2>
            <p class="text-lg text-gray-700 mb-8 whitespace-pre-line">${section.summary}</p>
            <div class="space-y-8">
                ${section.articles.map(article => `
                    <div class="flex gap-4 items-start">
                        <img src="${article.coverImage}" alt="${article.title}" class="w-32 h-32 object-cover rounded-lg shadow-md" />
                        <div>
                            <h3 class="font-semibold text-xl font-headline">${article.title}</h3>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    const sudokuBoard = (board: number[][]) => `
        <table class="border-collapse border-2 border-black">
            ${board.map((row, i) => `
                <tr class="${(i + 1) % 3 === 0 && i < 8 ? 'border-b-2 border-black' : ''}">
                    ${row.map((cell, j) => `
                        <td class="w-12 h-12 text-center text-2xl border border-gray-400 ${(j + 1) % 3 === 0 && j < 8 ? 'border-r-2 border-black' : ''}">
                            ${cell === 0 ? '' : cell}
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </table>
    `;

    const sudokuSection = `
        <div class="break-after-page">
            <h2 class="text-3xl font-bold font-headline text-primary mb-4">Puzzles & Brain Teasers</h2>
            <div class="flex flex-col items-center justify-center gap-12">
                <div>
                    <h3 class="text-xl font-semibold mb-4 text-center">Sudoku Challenge</h3>
                    ${sudokuBoard(data.sudoku.puzzle)}
                </div>
                 <div class="mt-8">
                    <h3 class="text-xl font-semibold mb-4 text-center">Last Week's Solution</h3>
                    ${sudokuBoard(data.sudoku.solution)}
                </div>
            </div>
        </div>
    `;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap"
              rel="stylesheet"
            />
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                }
                .font-headline {
                    font-family: 'Playfair Display', serif;
                }
                .text-primary {
                    color: #D9274A;
                }
                @media print {
                  .break-after-page {
                    page-break-after: always;
                  }
                }
            </style>
        </head>
        <body class="p-12">
            <div class="text-center break-after-page">
                <h1 class="text-6xl font-bold font-headline text-primary">${data.title}</h1>
                <p class="text-2xl text-gray-600 mt-4">${today}</p>
                <div class="mt-12 p-6 bg-gray-50 rounded-lg">
                    <h2 class="text-2xl font-bold font-headline mb-4">In This Issue</h2>
                    <ul class="list-none text-left space-y-2">
                        ${data.highlights.map(highlight => `<li class="text-lg text-gray-800 before:content-['\\272A'] before:mr-2 before:text-primary">${highlight}</li>`).join('')}
                    </ul>
                </div>
                <div class="text-xl text-gray-800 mt-8 text-left whitespace-pre-line">${data.introduction}</div>
            </div>

            ${sectionsHtml}
            
            ${sudokuSection}

            <div class="text-center pt-8">
                <p class="text-gray-600">Thank you for reading Diano Weekly.</p>
                <p class="text-sm text-gray-500">dianotimes.com</p>
            </div>
        </body>
        </html>
    `;
}


export async function generatePdfFromHtml(magazineData: GenerateMagazineOutput): Promise<Buffer> {
    const htmlContent = createMagazineHtml(magazineData);
    
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });

    const page = await browser.newPage();
    
    await page.setViewport({ width: 1080, height: 1024 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '1in',
            right: '1in',
            bottom: '1in',
            left: '1in',
        },
    });

    await browser.close();
    return pdfBuffer;
}
