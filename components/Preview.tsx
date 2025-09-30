import React, { useState } from 'react';
import { ContactForm } from '../types';

const Preview: React.FC<{ form: ContactForm; closePreview: () => void; }> = ({ form, closePreview }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const parseShortcodes = (content: string): string => {
        let parsedContent = content;

        const parseAttributes = (attrsStr: string): string => {
            if (!attrsStr) return '';
            return attrsStr.trim().split(/\s+/).map(part => {
                if (part.includes(':')) {
                    const [key, val] = part.split(':', 2);
                    return `${key}="${val}"`;
                }
                return '';
            }).filter(Boolean).join(' ');
        };

        // General inputs: text, email, url, tel, date
        parsedContent = parsedContent.replace(/\[(text|email|url|tel|date)\*?\s+([a-zA-Z0-9_-]+)(.*?)\]/g, (match, type, name, attrs) => {
            const required = match.includes('*');
            const attributes = parseAttributes(attrs);
            return `<input type="${type}" name="${name}" class="w-full p-2 border border-gray-300 rounded-md" ${required ? 'required' : ''} ${attributes} />`;
        });
        
        // Number
        parsedContent = parsedContent.replace(/\[number\*?\s+([a-zA-Z0-9_-]+)(.*?)\]/g, (match, name, attrs) => {
            const required = match.includes('*');
            const attributes = parseAttributes(attrs);
            return `<input type="number" name="${name}" class="w-full p-2 border border-gray-300 rounded-md" ${required ? 'required' : ''} ${attributes} />`;
        });

        // Textarea
        parsedContent = parsedContent.replace(/\[textarea\*?\s+([a-zA-Z0-9_-]+)(.*?)\]/g, (match, name, attrs) => {
            const required = match.includes('*');
            const attributes = parseAttributes(attrs);
            return `<textarea name="${name}" class="w-full h-32 p-2 border border-gray-300 rounded-md" ${required ? 'required' : ''} ${attributes}></textarea>`;
        });

        // Select
        parsedContent = parsedContent.replace(/\[select\*?\s+([a-zA-Z0-9_-]+)((?:\s+"[^"]+")+?)\]/g, (match, name, optionsStr) => {
            const required = match.includes('*');
            const options = optionsStr.match(/"[^"]+"/g)?.map(o => o.slice(1, -1));
            const optionElements = options?.map(opt => `<option value="${opt}">${opt}</option>`).join('') || '';
            return `<select name="${name}" class="w-full p-2 border border-gray-300 rounded-md" ${required ? 'required' : ''}>${optionElements}</select>`;
        });

        // Checkbox
        parsedContent = parsedContent.replace(/\[checkbox\*?\s+([a-zA-Z0-9_-]+)((?:\s+"[^"]+")+?)\]/g, (match, name, optionsStr) => {
            const options = optionsStr.match(/"[^"]+"/g)?.map(o => o.slice(1, -1));
            const checkboxElements = options?.map(opt => `
                <label class="inline-flex items-center">
                    <input type="checkbox" name="${name}[]" value="${opt}" class="h-4 w-4 text-brand-blue border-gray-300 rounded" />
                    <span class="ml-2">${opt}</span>
                </label>
            `).join('<br/>') || '';
            return `<div>${checkboxElements}</div>`;
        });

        // Radio
        parsedContent = parsedContent.replace(/\[radio\*?\s+([a-zA-Z0-9_-]+)(.*?)((?:\s+"[^"]+")+?)\]/g, (match, name, attrs, optionsStr) => {
            const options = optionsStr.match(/"[^"]+"/g)?.map(o => o.slice(1, -1));
            const radioElements = options?.map(opt => `
                <label class="inline-flex items-center mr-4">
                    <input type="radio" name="${name}" value="${opt}" class="h-4 w-4 text-brand-blue border-gray-300" />
                    <span class="ml-2">${opt}</span>
                </label>
            `).join('') || '';
            return `<div>${radioElements}</div>`;
        });

        // Submit
        parsedContent = parsedContent.replace(/\[submit\s+"([^"]+)"\]/g, (match, label) => {
            return `<button type="submit" class="px-4 py-2 bg-brand-blue text-white font-semibold rounded-md hover:bg-blue-800">${label}</button>`;
        });
        
        // Acceptance
        parsedContent = parsedContent.replace(/\[acceptance\s+([a-zA-Z0-9_-]+)\]\s*([^<]*)/g, (match, name, label) => {
            return `
                <label class="inline-flex items-center">
                    <input type="checkbox" name="${name}" required class="h-4 w-4 text-brand-blue border-gray-300 rounded" />
                    <span class="ml-2">${label.trim()}</span>
                </label>
            `;
        });

        // File
        parsedContent = parsedContent.replace(/\[file\*?\s+([a-zA-Z0-9_-]+)(.*?)\]/g, (match, name, attrs) => {
            const required = match.includes('*');
            const attributes = parseAttributes(attrs);
            return `<input type="file" name="${name}" class="w-full p-2 border border-gray-300 rounded-md" ${required ? 'required' : ''} ${attributes} />`;
        });
        
        // Quiz
        parsedContent = parsedContent.replace(/\[quiz\s+([a-zA-Z0-9_-]+)\s+"([^"]+)"\]/g, (match, name, quizStr) => {
            const [question] = quizStr.split('|');
            return `
                <label class="block mb-1">${question}</label>
                <input type="text" name="${name}" class="w-full p-2 border border-gray-300 rounded-md" required />
            `;
        });
        
        // Group
        parsedContent = parsedContent.replace(/\[\/?group.*?\]/g, '');

        // Newlines to <br>
        return parsedContent.replace(/(?:\r\n|\r|\n)/g, '<br />');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('This is a preview. Form submission is disabled.');
    };

    if (!form || !form.steps || form.steps.length === 0) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
                    <p>No form content to preview.</p>
                    <button onClick={closePreview}>Close</button>
                </div>
            </div>
        )
    }

    const stepContent = form.steps[currentStep]?.content || '';
    const parsedHtml = parseShortcodes(stepContent);
    
    const goToNextStep = () => {
        if (currentStep < form.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">{form.title} - Preview</h2>
                    <button onClick={closePreview} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />

                        {form.steps.length > 1 && (
                            <div className="flex justify-between mt-6 pt-4 border-t">
                                {currentStep > 0 ? (
                                    <button type="button" onClick={goToPrevStep} className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400">
                                        {form.multiStepSettings.prevButtonText || 'Previous'}
                                    </button>
                                ) : <div></div>}
                                
                                {currentStep < form.steps.length - 1 ? (
                                    <button type="button" onClick={goToNextStep} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-md hover:bg-blue-800">
                                        {form.multiStepSettings.nextButtonText || 'Next'}
                                    </button>
                                ) : null}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Preview;