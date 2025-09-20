
'use server';

import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';
import { htmlToText } from 'html-to-text';

function createMagazineHtml(data: GenerateMagazineOutput): string {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const sectionsHtml = data.sections.map(section => `
        <div>
            <h2>${section.title}</h2>
            <p>${section.summary}</p>
            <div>
                ${section.articles.map(article => `
                    <div>
                        <img src="${article.coverImage}" alt="${article.title}" />
                        <div>
                            <h3>${article.title}</h3>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    const sudokuBoard = (board: number[][]) => `
        <table>
            ${board.map(row => `
                <tr>
                    ${row.map(cell => `
                        <td>
                            ${cell === 0 ? '' : cell}
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </table>
    `;

    const sudokuSection = `
        <div>
            <h2>Puzzles & Brain Teasers</h2>
            <div>
                <div>
                    <h3>Sudoku Challenge</h3>
                    ${sudokuBoard(data.sudoku.puzzle)}
                </div>
                 <div>
                    <h3>Last Week's Solution</h3>
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
        </head>
        <body>
            <div>
                <h1>${data.title}</h1>
                <p>${today}</p>
                <div>
                    <h2>In This Issue</h2>
                    <ul>
                        ${data.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                <div>${data.introduction}</div>
            </div>

            ${sectionsHtml}
            
            ${sudokuSection}

            <div>
                <p>Thank you for reading Diano Weekly.</p>
                <p>dianotimes.com</p>
            </div>
        </body>
        </html>
    `;
}

export async function generateTextFromHtml(magazineData: GenerateMagazineOutput): Promise<string> {
    const htmlContent = createMagazineHtml(magazineData);
    const text = htmlToText(htmlContent, {
        wordwrap: 80,
        selectors: [
            { selector: 'h1', options: { uppercase: true, prefix: '*** ', suffix: ' ***' } },
            { selector: 'h2', options: { uppercase: true, prefix: '## ', suffix: ' ##' } },
            { selector: 'h3', options: { uppercase: false, prefix: '- ' } },
            { selector: 'img', format: 'skip' },
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'table', options: {
                colSpacing: 5,
                rowSpacing: 1,
            } },
        ]
    });
    return text;
}
