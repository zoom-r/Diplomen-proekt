/**
 * Включва основните JavaScript скриптове за HTML страницата.
 * @returns {string} - HTML съдържание с включените скриптове.
 */
function includeEssentialHtmlScripts(): string {
    let script = '';
    script += include('public/js/bs-init.js');
    script += include('public/js/nav.js');
    return script;
}

/**
 * Включва основните CSS стилове за HTML страницата.
 * @returns {string} - HTML съдържание с включените стилове.
 */
function includeEssentialHtmlStyles(): string {
    let style = '';
    style += include('public/css/Navbar-With-Button-icons.css');
    return style;
}

/**
 * Включва съдържанието на даден HTML файл.
 * @param {string} filename - Името на файла, който ще бъде включен.
 * @returns {string} - Съдържанието на HTML файла.
 */
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}